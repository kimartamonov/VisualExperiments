import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import { ConflictError, NotFoundError, ValidationError } from "./errors.js";
import { getNodeTypeDefinition, NODE_TYPE_DEFINITIONS, type ModelNodeTyping } from "../shared/node-typing.js";

export interface ProjectManifest {
  id: string;
  name: string;
  defaultModel?: string;
  notations?: string[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  folderName: string;
  defaultModel?: string;
  notationCount: number;
}

export interface ProjectDetails extends ProjectSummary {
  projectRootName: string;
  manifestPath: string;
  modelsPath: string;
  hasModels: boolean;
}

export interface ProjectSaveResult {
  projectId: string;
  savedAt: string;
  modelCount: number;
  notationCount: number;
  defaultModel?: string;
}

export interface ProjectTreeNode {
  name: string;
  path: string;
  kind: "directory" | "file";
  children?: ProjectTreeNode[];
}

export interface ModelNodePosition {
  x: number;
  y: number;
}

export interface ModelNode {
  id: string;
  label: string;
  description: string;
  position: ModelNodePosition;
  drilldowns: string[];
  typing?: ModelNodeTyping;
}

export interface ModelEdge {
  id: string;
  source: string;
  target: string;
}

export interface StepUpLink {
  model: string;
  nodeId: string;
}

export type FrameStepUpMode = "default" | "regenerate";

export interface ModelFrame {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  stepUp: StepUpLink | null;
}

export interface ModelDocument {
  id: string;
  name: string;
  notation: "freeform" | string;
  nodes: ModelNode[];
  edges: ModelEdge[];
  frames: ModelFrame[];
}

export interface ModelDetails extends ModelDocument {
  path: string;
}

export interface FrameStepUpResult {
  sourceModel: ModelDetails;
  upperModel: ModelDetails;
  link: StepUpLink;
  created: boolean;
  regenerated: boolean;
}

export interface NotationTypeDefinition {
  id: string;
  name: string;
  color: string;
}

export interface NotationDocument {
  id: string;
  name: string;
  types: NotationTypeDefinition[];
  recommendedDrilldowns?: Record<string, string[]>;
}

export interface NotationDetails extends NotationDocument {
  path: string;
}

export interface CreateNotationResult {
  model: ModelDetails;
  notation: NotationDetails;
}

interface ProjectRecord {
  folderName: string;
  manifest: ProjectManifest;
}

export class ProjectService {
  constructor(private readonly projectsRoot: string) {}

  async listProjects(): Promise<ProjectSummary[]> {
    const records = await this.readProjectRecords();

    return records
      .map((record) => this.toSummary(record))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async getProject(projectId: string): Promise<ProjectDetails> {
    const record = await this.findProjectRecord(projectId);
    const modelsPath = path.join(this.projectsRoot, record.folderName, "models");
    const modelEntries = await fs.readdir(modelsPath, { withFileTypes: true });
    const hasModels = modelEntries.some((entry) => entry.isFile() || entry.isDirectory());

    return {
      ...this.toSummary(record),
      projectRootName: record.folderName,
      manifestPath: "project.yaml",
      modelsPath: "models/",
      hasModels
    };
  }

  async createProject(rawName: string): Promise<ProjectDetails> {
    const name = rawName.trim();

    if (!name) {
      throw new ValidationError("Project name is required.");
    }

    await this.ensureProjectsRoot();

    const folderName = slugify(name, "project");
    const projectPath = path.join(this.projectsRoot, folderName);

    if (await pathExists(projectPath)) {
      throw new ConflictError(`A project folder named "${folderName}" already exists.`);
    }

    const manifest: ProjectManifest = {
      id: `project-${randomUUID()}`,
      name
    };

    await fs.mkdir(path.join(projectPath, "models"), { recursive: true });
    await fs.writeFile(
      path.join(projectPath, "project.yaml"),
      serializeManifest(manifest),
      "utf8"
    );

    return this.getProject(manifest.id);
  }

  async getProjectTree(projectId: string): Promise<ProjectTreeNode> {
    const { projectRoot } = await this.resolveProjectContext(projectId);

    return this.readTree(projectRoot, "");
  }

  async listNotations(projectId: string): Promise<NotationDetails[]> {
    const { record, projectRoot } = await this.resolveProjectContext(projectId);

    return this.readNotationDetails(record.manifest, projectRoot);
  }

  async saveProject(projectId: string): Promise<ProjectSaveResult> {
    const { record, projectRoot, manifestAbsolutePath } = await this.resolveProjectContext(projectId);
    const manifest = normalizeProjectManifest(record.manifest);
    const modelPaths = await this.collectYamlPaths(path.join(projectRoot, "models"), "models");
    let notationCount = 0;

    for (const modelPath of modelPaths) {
      const absoluteModelPath = resolveInsideRoot(projectRoot, modelPath);
      const model = await readModel(absoluteModelPath);
      await this.persistModel(absoluteModelPath, model);
    }

    for (const notationPath of manifest.notations ?? []) {
      const absoluteNotationPath = resolveInsideRoot(projectRoot, notationPath);

      if (!(await pathExists(absoluteNotationPath))) {
        continue;
      }

      const notation = await readNotation(absoluteNotationPath);
      await fs.writeFile(absoluteNotationPath, serializeYaml(notation), "utf8");
      notationCount += 1;
    }

    await fs.writeFile(manifestAbsolutePath, serializeManifest(manifest), "utf8");

    return {
      projectId: record.manifest.id,
      savedAt: new Date().toISOString(),
      modelCount: modelPaths.length,
      notationCount,
      defaultModel: manifest.defaultModel
    };
  }

  async createFreeformModel(projectId: string, rawName: string, selectedPath?: string | null): Promise<ModelDetails> {
    return this.createModelWithNotation(projectId, rawName, selectedPath, "freeform");
  }

  async createTypedModel(
    projectId: string,
    rawName: string,
    notationId: string,
    selectedPath?: string | null
  ): Promise<ModelDetails> {
    return this.createModelWithNotation(projectId, rawName, selectedPath, notationId);
  }

  private async createModelWithNotation(
    projectId: string,
    rawName: string,
    selectedPath: string | null | undefined,
    notationId: "freeform" | string
  ): Promise<ModelDetails> {
    const name = rawName.trim();

    if (!name) {
      throw new ValidationError("Model name is required.");
    }

    const context = await this.resolveProjectContext(projectId);
    const normalizedNotationId = notationId === "freeform" ? "freeform" : notationId.trim();

    if (normalizedNotationId !== "freeform") {
      await this.resolveNotationById(context.record.manifest, context.projectRoot, normalizedNotationId);
    }

    const modelsRoot = path.join(context.projectRoot, "models");
    const normalizedSelection = normalizeRelativePath(selectedPath);
    const selectedDirectory = await this.resolveSelectedDirectory(context.projectRoot, modelsRoot, normalizedSelection);
    const shouldUseMainName = !(await this.projectHasModels(modelsRoot)) && !selectedDirectory;
    const modelPath = shouldUseMainName
      ? "models/main.yaml"
      : await this.createUniqueModelPath(context.projectRoot, selectedDirectory, name);
    const absoluteModelPath = resolveInsideRoot(context.projectRoot, modelPath);
    const model: ModelDocument = {
      id: `model-${randomUUID()}`,
      name,
      notation: normalizedNotationId,
      nodes: [],
      edges: [],
      frames: []
    };

    await fs.mkdir(path.dirname(absoluteModelPath), { recursive: true });
    await fs.writeFile(absoluteModelPath, serializeYaml(model), "utf8");

    if (!context.record.manifest.defaultModel) {
      context.record.manifest.defaultModel = modelPath;
      await fs.writeFile(context.manifestAbsolutePath, serializeYaml(context.record.manifest), "utf8");
    }

    return this.getModel(projectId, modelPath);
  }

  async getModel(projectId: string, requestedPath: string): Promise<ModelDetails> {
    const { projectRoot } = await this.resolveProjectContext(projectId);
    const normalizedPath = normalizeRelativePath(requestedPath);

    if (!normalizedPath || !normalizedPath.endsWith(".yaml") || normalizedPath === "project.yaml") {
      throw new ValidationError("A valid model path is required.");
    }

    const absolutePath = resolveInsideRoot(projectRoot, normalizedPath);

    if (!(await pathExists(absolutePath))) {
      throw new NotFoundError(`Model "${normalizedPath}" was not found.`);
    }

    const model = await readModel(absolutePath);

    return {
      path: normalizedPath,
      ...model
    };
  }

  async createNotationFromModel(projectId: string, modelPath: string): Promise<CreateNotationResult> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const notationTypes = extractNotationTypes(context.model);

    if (notationTypes.length === 0) {
      throw new ValidationError("Current model has no typed nodes to extract into notation.");
    }

    const notationPath = await this.createUniqueNotationPath(context.projectRoot, context.model.name);
    const notationId = path.basename(notationPath, ".yaml");
    const notation: NotationDocument = {
      id: notationId,
      name: context.model.name,
      types: notationTypes
    };
    const absoluteNotationPath = resolveInsideRoot(context.projectRoot, notationPath);

    context.model.notation = notationId;
    context.record.manifest.notations = mergeNotationPaths(context.record.manifest.notations, notationPath);

    await fs.mkdir(path.dirname(absoluteNotationPath), { recursive: true });
    await fs.writeFile(absoluteNotationPath, serializeYaml(notation), "utf8");
    await this.persistModel(context.absolutePath, context.model);
    await fs.writeFile(context.manifestAbsolutePath, serializeManifest(context.record.manifest), "utf8");

    return {
      model: {
        path: context.modelPath,
        ...context.model
      },
      notation: {
        path: notationPath,
        ...notation
      }
    };
  }

  async createNode(
    projectId: string,
    modelPath: string,
    input: {
      label?: string;
      position: unknown;
      typing?: unknown;
    }
  ): Promise<{ model: ModelDetails; node: ModelNode }> {
    const normalizedPosition = validateNodePosition(input.position);
    const context = await this.loadModelForMutation(projectId, modelPath);
    const notation =
      context.model.notation === "freeform"
        ? null
        : await this.tryResolveNotationById(context.record.manifest, context.projectRoot, context.model.notation);
    const typing = input.typing === undefined ? undefined : validateNodeTyping(input.typing);

    if (notation) {
      if (!typing) {
        throw new ValidationError(`Typed model "${context.model.name}" requires a notation type when creating a node.`);
      }

      ensureNotationAllowsTyping(notation, typing);
    }

    const node: ModelNode = {
      id: `node-${randomUUID()}`,
      label: normalizeNodeLabel(input.label, context.model.nodes.length + 1),
      description: "",
      position: normalizedPosition,
      drilldowns: [],
      ...(typing ? { typing } : {})
    };

    context.model.nodes.push(node);
    await this.persistModel(context.absolutePath, context.model);

    return {
      model: {
        path: context.modelPath,
        ...context.model
      },
      node
    };
  }

  async updateNode(
    projectId: string,
    modelPath: string,
    nodeId: string,
    patch: {
      label?: string;
      description?: string;
      position?: unknown;
      drilldowns?: unknown;
      typing?: unknown;
    }
  ): Promise<ModelDetails> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const node = context.model.nodes.find((candidate) => candidate.id === nodeId);

    if (!node) {
      throw new NotFoundError(`Node "${nodeId}" was not found.`);
    }

    if (patch.label !== undefined) {
      const nextLabel = patch.label.trim();

      if (!nextLabel) {
        throw new ValidationError("Node label is required.");
      }

      node.label = nextLabel;
    }

    if (patch.description !== undefined) {
      node.description = patch.description.trim();
    }

    if (patch.position !== undefined) {
      node.position = validateNodePosition(patch.position);
    }

    if (patch.drilldowns !== undefined) {
      node.drilldowns = validateNodeDrilldowns(patch.drilldowns, context.modelPath);
    }

    if (patch.typing !== undefined) {
      const nextTyping = validateNodeTyping(patch.typing);

      if (nextTyping) {
        node.typing = nextTyping;
      } else {
        delete node.typing;
      }
    }

    await this.persistModel(context.absolutePath, context.model);

    return {
      path: context.modelPath,
      ...context.model
    };
  }

  async deleteNode(projectId: string, modelPath: string, nodeId: string): Promise<ModelDetails> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const nextNodes = context.model.nodes.filter((node) => node.id !== nodeId);

    if (nextNodes.length === context.model.nodes.length) {
      throw new NotFoundError(`Node "${nodeId}" was not found.`);
    }

    context.model.nodes = nextNodes;
    context.model.edges = context.model.edges.filter((edge) => !edgeReferencesNode(edge, nodeId));
    context.model.frames = context.model.frames.map((frame) => removeNodeFromFrame(frame, nodeId));
    await this.persistModel(context.absolutePath, context.model);

    return {
      path: context.modelPath,
      ...context.model
    };
  }

  async createEdge(
    projectId: string,
    modelPath: string,
    input: {
      source: string;
      target: string;
    }
  ): Promise<{ model: ModelDetails; edge: ModelEdge }> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const source = normalizeEdgeNodeId(input.source, "source");
    const target = normalizeEdgeNodeId(input.target, "target");

    if (!context.model.nodes.some((node) => node.id === source)) {
      throw new ValidationError(`Source node "${source}" does not exist.`);
    }

    if (!context.model.nodes.some((node) => node.id === target)) {
      throw new ValidationError(`Target node "${target}" does not exist.`);
    }

    const edge: ModelEdge = {
      id: `edge-${randomUUID()}`,
      source,
      target
    };

    context.model.edges.push(edge);
    await this.persistModel(context.absolutePath, context.model);

    return {
      model: {
        path: context.modelPath,
        ...context.model
      },
      edge
    };
  }

  async deleteEdge(projectId: string, modelPath: string, edgeId: string): Promise<ModelDetails> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const nextEdges = context.model.edges.filter((edge) => edge.id !== edgeId);

    if (nextEdges.length === context.model.edges.length) {
      throw new NotFoundError(`Edge "${edgeId}" was not found.`);
    }

    context.model.edges = nextEdges;
    await this.persistModel(context.absolutePath, context.model);

    return {
      path: context.modelPath,
      ...context.model
    };
  }

  async createFrame(
    projectId: string,
    modelPath: string,
    input?: {
      name?: string;
      description?: string;
      nodeIds?: string[];
    }
  ): Promise<{ model: ModelDetails; frame: ModelFrame }> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const nodeIds = validateFrameNodeIds(input?.nodeIds, context.model.nodes);
    const frame: ModelFrame = {
      id: `frame-${randomUUID()}`,
      name: normalizeFrameName(input?.name, context.model.frames.length + 1),
      description: input?.description?.trim() ?? "",
      nodeIds,
      stepUp: null
    };

    context.model.frames.push(frame);
    await this.persistModel(context.absolutePath, context.model);

    return {
      model: {
        path: context.modelPath,
        ...context.model
      },
      frame
    };
  }

  async updateFrame(
    projectId: string,
    modelPath: string,
    frameId: string,
    patch: {
      name?: string;
      description?: string;
      nodeIds?: unknown;
    }
  ): Promise<ModelDetails> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const frame = context.model.frames.find((candidate) => candidate.id === frameId);

    if (!frame) {
      throw new NotFoundError(`Frame "${frameId}" was not found.`);
    }

    if (patch.name !== undefined) {
      const nextName = patch.name.trim();

      if (!nextName) {
        throw new ValidationError("Frame name is required.");
      }

      frame.name = nextName;
    }

    if (patch.description !== undefined) {
      frame.description = patch.description.trim();
    }

    if (patch.nodeIds !== undefined) {
      frame.nodeIds = validateFrameNodeIds(patch.nodeIds, context.model.nodes);
    }

    await this.persistModel(context.absolutePath, context.model);

    return {
      path: context.modelPath,
      ...context.model
    };
  }

  async deleteFrame(projectId: string, modelPath: string, frameId: string): Promise<ModelDetails> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const nextFrames = context.model.frames.filter((frame) => frame.id !== frameId);

    if (nextFrames.length === context.model.frames.length) {
      throw new NotFoundError(`Frame "${frameId}" was not found.`);
    }

    context.model.frames = nextFrames;
    await this.persistModel(context.absolutePath, context.model);

    return {
      path: context.modelPath,
      ...context.model
    };
  }

  async stepUpFrame(
    projectId: string,
    modelPath: string,
    frameId: string,
    mode: FrameStepUpMode = "default"
  ): Promise<FrameStepUpResult> {
    const context = await this.loadModelForMutation(projectId, modelPath);
    const frame = context.model.frames.find((candidate) => candidate.id === frameId);

    if (!frame) {
      throw new NotFoundError(`Frame "${frameId}" was not found.`);
    }

    const hadExistingLink = frame.stepUp !== null;
    let link = frame.stepUp;

    if (!link) {
      link = {
        model: await this.createUniqueAbstractionPath(context.projectRoot, frame.name),
        nodeId: `node-${randomUUID()}`
      };
      frame.stepUp = link;
    }

    const upperModelPath = normalizeModelPath(link.model);
    const upperModelAbsolutePath = resolveInsideRoot(context.projectRoot, upperModelPath);
    const upperModelExists = await pathExists(upperModelAbsolutePath);

    if (!upperModelExists && hadExistingLink && mode === "default") {
      throw new NotFoundError(`Step-up target model "${upperModelPath}" was not found.`);
    }

    let upperModel: ModelDocument;

    if (!upperModelExists) {
      upperModel = createUpperLevelModelDocument(frame, link.nodeId);
    } else {
      upperModel = await readModel(upperModelAbsolutePath);

      if (mode === "regenerate") {
        upperModel = regenerateUpperLevelModel(upperModel, frame, link.nodeId);
      }
    }

    const shouldPersistSourceModel = !hadExistingLink;
    const shouldPersistUpperModel = !upperModelExists || mode === "regenerate";

    if (shouldPersistUpperModel) {
      await fs.mkdir(path.dirname(upperModelAbsolutePath), { recursive: true });
      await this.persistModel(upperModelAbsolutePath, upperModel);
    }

    if (shouldPersistSourceModel) {
      await this.persistModel(context.absolutePath, context.model);
    }

    return {
      sourceModel: {
        path: context.modelPath,
        ...context.model
      },
      upperModel: {
        path: upperModelPath,
        ...upperModel
      },
      link,
      created: !hadExistingLink,
      regenerated: mode === "regenerate"
    };
  }

  private async readProjectRecords(): Promise<ProjectRecord[]> {
    await this.ensureProjectsRoot();

    const entries = await fs.readdir(this.projectsRoot, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());
    const records: ProjectRecord[] = [];

    for (const directory of directories) {
      const manifestPath = path.join(this.projectsRoot, directory.name, "project.yaml");

      if (!(await pathExists(manifestPath))) {
        continue;
      }

      records.push({
        folderName: directory.name,
        manifest: await readManifest(manifestPath)
      });
    }

    return records;
  }

  private async findProjectRecord(projectId: string): Promise<ProjectRecord> {
    const records = await this.readProjectRecords();
    const match = records.find((record) => record.manifest.id === projectId);

    if (!match) {
      throw new NotFoundError(`Project "${projectId}" was not found.`);
    }

    return match;
  }

  private async ensureProjectsRoot(): Promise<void> {
    await fs.mkdir(this.projectsRoot, { recursive: true });
  }

  private async resolveProjectContext(projectId: string): Promise<{
    record: ProjectRecord;
    projectRoot: string;
    manifestAbsolutePath: string;
  }> {
    const record = await this.findProjectRecord(projectId);
    const projectRoot = path.join(this.projectsRoot, record.folderName);

    return {
      record,
      projectRoot,
      manifestAbsolutePath: path.join(projectRoot, "project.yaml")
    };
  }

  private async loadModelForMutation(
    projectId: string,
    requestedPath: string
  ): Promise<{
    record: ProjectRecord;
    projectRoot: string;
    manifestAbsolutePath: string;
    absolutePath: string;
    modelPath: string;
    model: ModelDocument;
  }> {
    const { record, projectRoot, manifestAbsolutePath } = await this.resolveProjectContext(projectId);
    const modelPath = normalizeModelPath(requestedPath);
    const absolutePath = resolveInsideRoot(projectRoot, modelPath);

    if (!(await pathExists(absolutePath))) {
      throw new NotFoundError(`Model "${modelPath}" was not found.`);
    }

    return {
      record,
      projectRoot,
      manifestAbsolutePath,
      absolutePath,
      modelPath,
      model: await readModel(absolutePath)
    };
  }

  private async persistModel(absolutePath: string, model: ModelDocument): Promise<void> {
    await fs.writeFile(absolutePath, serializeYaml(model), "utf8");
  }

  private async collectYamlPaths(absoluteDirectory: string, relativeDirectory: string): Promise<string[]> {
    if (!(await pathExists(absoluteDirectory))) {
      return [];
    }

    const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true });
    const nestedPaths = await Promise.all(
      entries
        .filter((entry) => !entry.name.startsWith("."))
        .map(async (entry) => {
          const nextRelativePath = toPosixPath(path.join(relativeDirectory, entry.name));
          const nextAbsolutePath = path.join(absoluteDirectory, entry.name);

          if (entry.isDirectory()) {
            return this.collectYamlPaths(nextAbsolutePath, nextRelativePath);
          }

          if (entry.isFile() && entry.name.endsWith(".yaml")) {
            return [nextRelativePath];
          }

          return [];
        })
    );

    return nestedPaths.flat().sort((left, right) => left.localeCompare(right));
  }

  private async readNotationDetails(manifest: ProjectManifest, projectRoot: string): Promise<NotationDetails[]> {
    const notationDetails: NotationDetails[] = [];

    for (const notationPath of manifest.notations ?? []) {
      const absoluteNotationPath = resolveInsideRoot(projectRoot, notationPath);

      if (!(await pathExists(absoluteNotationPath))) {
        continue;
      }

      try {
        notationDetails.push({
          path: notationPath,
          ...(await readNotation(absoluteNotationPath))
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          continue;
        }

        throw error;
      }
    }

    return notationDetails.sort((left, right) => left.name.localeCompare(right.name));
  }

  private async resolveNotationById(
    manifest: ProjectManifest,
    projectRoot: string,
    notationId: string
  ): Promise<NotationDetails> {
    const notationDetails = await this.readNotationDetails(manifest, projectRoot);
    const notation = notationDetails.find((candidate) => candidate.id === notationId);

    if (!notation) {
      throw new ValidationError(`Notation "${notationId}" is not registered in project.yaml.`);
    }

    return notation;
  }

  private async tryResolveNotationById(
    manifest: ProjectManifest,
    projectRoot: string,
    notationId: string
  ): Promise<NotationDetails | null> {
    try {
      return await this.resolveNotationById(manifest, projectRoot, notationId);
    } catch (error) {
      if (error instanceof ValidationError) {
        return null;
      }

      throw error;
    }
  }

  private toSummary(record: ProjectRecord): ProjectSummary {
    return {
      id: record.manifest.id,
      name: record.manifest.name,
      folderName: record.folderName,
      defaultModel: record.manifest.defaultModel,
      notationCount: record.manifest.notations?.length ?? 0
    };
  }

  private async readTree(projectRoot: string, relativePath: string): Promise<ProjectTreeNode> {
    const targetPath = relativePath ? path.join(projectRoot, relativePath) : projectRoot;
    const stats = await fs.stat(targetPath);
    const name = relativePath ? path.basename(relativePath) : path.basename(projectRoot);

    if (!stats.isDirectory()) {
      return {
        name,
        path: toPosixPath(relativePath),
        kind: "file"
      };
    }

    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    const visibleEntries = entries.filter((entry) => !entry.name.startsWith("."));
    const sortedEntries = visibleEntries.sort(compareTreeEntries);
    const children = await Promise.all(
      sortedEntries.map((entry) =>
        this.readTree(projectRoot, relativePath ? path.join(relativePath, entry.name) : entry.name)
      )
    );

    return {
      name,
      path: toPosixPath(relativePath),
      kind: "directory",
      children
    };
  }

  private async projectHasModels(modelsRoot: string): Promise<boolean> {
    const entries = await fs.readdir(modelsRoot, { withFileTypes: true });

    for (const entry of entries) {
      const candidatePath = path.join(modelsRoot, entry.name);

      if (entry.isFile() && entry.name.endsWith(".yaml")) {
        return true;
      }

      if (entry.isDirectory() && (await this.projectHasModels(candidatePath))) {
        return true;
      }
    }

    return false;
  }

  private async resolveSelectedDirectory(
    projectRoot: string,
    modelsRoot: string,
    selectedPath?: string | null
  ): Promise<string | null> {
    if (!selectedPath || selectedPath === "project-root" || selectedPath === "project.yaml") {
      return null;
    }

    const absoluteSelectedPath = resolveInsideRoot(projectRoot, selectedPath);

    if (!(await pathExists(absoluteSelectedPath))) {
      return null;
    }

    const stats = await fs.stat(absoluteSelectedPath);
    const selectedDirectory = stats.isDirectory() ? absoluteSelectedPath : path.dirname(absoluteSelectedPath);
    const relativeDirectory = toPosixPath(path.relative(projectRoot, selectedDirectory));

    if (!relativeDirectory || relativeDirectory === ".") {
      return null;
    }

    const absoluteModelsRoot = path.resolve(modelsRoot);
    const absoluteDirectory = path.resolve(selectedDirectory);
    const relativeToModels = path.relative(absoluteModelsRoot, absoluteDirectory);

    if (relativeToModels.startsWith("..") || path.isAbsolute(relativeToModels)) {
      return null;
    }

    return relativeDirectory;
  }

  private async createUniqueModelPath(projectRoot: string, selectedDirectory: string | null, modelName: string): Promise<string> {
    const baseDirectory = selectedDirectory ?? "models";
    const baseSlug = slugify(modelName, "model");
    let attempt = 0;

    while (true) {
      const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
      const candidatePath = toPosixPath(path.join(baseDirectory, `${baseSlug}${suffix}.yaml`));
      const absoluteCandidatePath = resolveInsideRoot(projectRoot, candidatePath);

      if (!(await pathExists(absoluteCandidatePath))) {
        return candidatePath;
      }

      attempt += 1;
    }
  }

  private async createUniqueAbstractionPath(projectRoot: string, frameName: string): Promise<string> {
    const baseSlug = slugify(frameName, "step-up");
    let attempt = 0;

    while (true) {
      const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
      const candidatePath = `models/abstractions/${baseSlug}${suffix}.yaml`;
      const absoluteCandidatePath = resolveInsideRoot(projectRoot, candidatePath);

      if (!(await pathExists(absoluteCandidatePath))) {
        return candidatePath;
      }

      attempt += 1;
    }
  }

  private async createUniqueNotationPath(projectRoot: string, notationName: string): Promise<string> {
    const baseSlug = slugify(notationName, "notation");
    let attempt = 0;

    while (true) {
      const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
      const candidatePath = `notations/${baseSlug}${suffix}.yaml`;
      const absoluteCandidatePath = resolveInsideRoot(projectRoot, candidatePath);

      if (!(await pathExists(absoluteCandidatePath))) {
        return candidatePath;
      }

      attempt += 1;
    }
  }
}

export function slugify(value: string, fallback: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

function serializeManifest(manifest: ProjectManifest): string {
  return serializeYaml(manifest);
}

async function readManifest(manifestPath: string): Promise<ProjectManifest> {
  const rawManifest = await fs.readFile(manifestPath, "utf8");
  let parsedManifest: unknown;

  try {
    parsedManifest = yaml.load(rawManifest);
  } catch {
    throw new ValidationError(`Invalid project manifest at "${manifestPath}".`);
  }

  if (!isProjectManifest(parsedManifest)) {
    throw new ValidationError(`Invalid project manifest at "${manifestPath}".`);
  }

  return normalizeProjectManifest(parsedManifest);
}

async function readModel(modelPath: string): Promise<ModelDocument> {
  const rawModel = await fs.readFile(modelPath, "utf8");
  let parsedModel: unknown;

  try {
    parsedModel = yaml.load(rawModel);
  } catch {
    throw new ValidationError(`Invalid model document at "${modelPath}".`);
  }

  if (!isModelDocument(parsedModel)) {
    throw new ValidationError(`Invalid model document at "${modelPath}".`);
  }

  return normalizeModelDocument(parsedModel);
}

async function readNotation(notationPath: string): Promise<NotationDocument> {
  const rawNotation = await fs.readFile(notationPath, "utf8");
  let parsedNotation: unknown;

  try {
    parsedNotation = yaml.load(rawNotation);
  } catch {
    throw new ValidationError(`Invalid notation document at "${notationPath}".`);
  }

  if (!isNotationDocument(parsedNotation)) {
    throw new ValidationError(`Invalid notation document at "${notationPath}".`);
  }

  return normalizeNotationDocument(parsedNotation);
}

function isProjectManifest(value: unknown): value is ProjectManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.id !== "string" || typeof record.name !== "string") {
    return false;
  }

  if (record.defaultModel !== undefined && typeof record.defaultModel !== "string") {
    return false;
  }

  if (
    record.notations !== undefined &&
    (!Array.isArray(record.notations) || record.notations.some((notation) => typeof notation !== "string"))
  ) {
    return false;
  }

  return true;
}

function isNotationDocument(value: unknown): value is NotationDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    Array.isArray(record.types) &&
    record.types.every(isNotationTypeDefinition) &&
    (record.recommendedDrilldowns === undefined || isRecommendedDrilldownMap(record.recommendedDrilldowns))
  );
}

function isModelDocument(value: unknown): value is ModelDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.notation === "string" &&
    Array.isArray(record.nodes) &&
    record.nodes.every(isModelNode) &&
    Array.isArray(record.edges) &&
    record.edges.every(isModelEdge) &&
    Array.isArray(record.frames) &&
    record.frames.every(isModelFrame)
  );
}

function isNotationTypeDefinition(value: unknown): value is NotationTypeDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.id === "string" && typeof record.name === "string" && typeof record.color === "string";
}

function isRecommendedDrilldownMap(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (candidate) => Array.isArray(candidate) && candidate.every((entry) => typeof entry === "string")
  );
}

function isModelNode(value: unknown): value is ModelNode {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.label === "string" &&
    typeof record.description === "string" &&
    isModelNodePosition(record.position) &&
    (record.drilldowns === undefined ||
      (Array.isArray(record.drilldowns) && record.drilldowns.every((candidate) => typeof candidate === "string"))) &&
    (record.typing === undefined || record.typing === null || isModelNodeTyping(record.typing))
  );
}

function isModelNodeTyping(value: unknown): value is ModelNodeTyping {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.typeId === "string" && typeof record.colorToken === "string";
}

function isModelNodePosition(value: unknown): value is ModelNodePosition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.x === "number" && Number.isFinite(record.x) && typeof record.y === "number" && Number.isFinite(record.y);
}

function isModelEdge(value: unknown): value is ModelEdge {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.id === "string" && typeof record.source === "string" && typeof record.target === "string";
}

function isModelFrame(value: unknown): value is ModelFrame {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.description === "string" &&
    Array.isArray(record.nodeIds) &&
    record.nodeIds.every((candidate) => typeof candidate === "string") &&
    (record.stepUp === null || isStepUpLink(record.stepUp))
  );
}

function isStepUpLink(value: unknown): value is StepUpLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.model === "string" && typeof record.nodeId === "string";
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function compareTreeEntries(left: Dirent, right: Dirent): number {
  if (left.isDirectory() && !right.isDirectory()) {
    return -1;
  }

  if (!left.isDirectory() && right.isDirectory()) {
    return 1;
  }

  return left.name.localeCompare(right.name);
}

function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}

function normalizeRelativePath(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.replace(/\\/g, "/").replace(/^\/+/, "");
}

function normalizeModelPath(requestedPath: string): string {
  const normalizedPath = normalizeRelativePath(requestedPath);

  if (!normalizedPath || !normalizedPath.endsWith(".yaml") || normalizedPath === "project.yaml") {
    throw new ValidationError("A valid model path is required.");
  }

  return normalizedPath;
}

function normalizeNotationPath(requestedPath: string): string {
  const normalizedPath = normalizeRelativePath(requestedPath);

  if (!normalizedPath || !normalizedPath.endsWith(".yaml") || normalizedPath === "project.yaml") {
    throw new ValidationError("A valid notation path is required.");
  }

  return normalizedPath;
}

function resolveInsideRoot(root: string, relativePath: string): string {
  const absoluteRoot = path.resolve(root);
  const absolutePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(absoluteRoot, absolutePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new ValidationError("Path escapes the project root.");
  }

  return absolutePath;
}

function serializeYaml(document: object): string {
  return `${yaml.dump(document, {
    noRefs: true,
    sortKeys: false,
    lineWidth: -1
  }).trimEnd()}\n`;
}

function validateNodePosition(position: unknown): ModelNodePosition {
  if (!isModelNodePosition(position)) {
    throw new ValidationError("Node position must contain finite x and y coordinates.");
  }

  return {
    x: roundCoordinate(position.x),
    y: roundCoordinate(position.y)
  };
}

function createUpperLevelModelDocument(frame: ModelFrame, representativeNodeId: string): ModelDocument {
  return {
    id: `model-${randomUUID()}`,
    name: buildUpperLevelModelName(frame),
    notation: "freeform",
    nodes: [buildRepresentativeNode(frame, representativeNodeId)],
    edges: [],
    frames: []
  };
}

function regenerateUpperLevelModel(model: ModelDocument, frame: ModelFrame, representativeNodeId: string): ModelDocument {
  const representativeNode = model.nodes.find((candidate) => candidate.id === representativeNodeId);

  if (representativeNode) {
    representativeNode.label = frame.name;
    representativeNode.description = buildRepresentativeNodeDescription(frame);
    representativeNode.position = {
      x: 160,
      y: 120
    };
    representativeNode.drilldowns = [];
  } else {
    model.nodes.push(buildRepresentativeNode(frame, representativeNodeId));
  }

  model.name = buildUpperLevelModelName(frame);

  return model;
}

function buildUpperLevelModelName(frame: ModelFrame): string {
  return `${frame.name} Abstraction`;
}

function buildRepresentativeNode(frame: ModelFrame, representativeNodeId: string): ModelNode {
  return {
    id: representativeNodeId,
    label: frame.name,
    description: buildRepresentativeNodeDescription(frame),
    position: {
      x: 160,
      y: 120
    },
    drilldowns: []
  };
}

function buildRepresentativeNodeDescription(frame: ModelFrame): string {
  return `Frame ${frame.id}; nodeCount=${frame.nodeIds.length}; ${frame.description}`.trim();
}

function normalizeModelDocument(model: ModelDocument): ModelDocument {
  return {
    id: model.id,
    name: model.name,
    notation: model.notation,
    nodes: model.nodes.map((node) => normalizeModelNode(node)),
    edges: model.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    })),
    frames: model.frames.map((frame) => ({
      id: frame.id,
      name: frame.name,
      description: frame.description,
      nodeIds: [...frame.nodeIds],
      stepUp: frame.stepUp
        ? {
            model: frame.stepUp.model,
            nodeId: frame.stepUp.nodeId
          }
        : null
    }))
  };
}

function extractNotationTypes(model: ModelDocument): NotationTypeDefinition[] {
  const typedIds = new Set(model.nodes.flatMap((node) => (node.typing ? [node.typing.typeId] : [])));

  return NODE_TYPE_DEFINITIONS.filter((definition) => typedIds.has(definition.id)).map((definition) => ({
    id: definition.id,
    name: definition.label,
    color: definition.hexColor
  }));
}

function normalizeModelNode(node: ModelNode): ModelNode {
  const normalizedTyping = normalizePersistedNodeTyping(node.typing);

  return {
    id: node.id,
    label: node.label,
    description: node.description,
    position: {
      x: roundCoordinate(node.position.x),
      y: roundCoordinate(node.position.y)
    },
    drilldowns: normalizePersistedNodeDrilldowns(node.drilldowns),
    ...(normalizedTyping ? { typing: normalizedTyping } : {})
  };
}

function normalizeProjectManifest(manifest: ProjectManifest): ProjectManifest {
  return {
    id: manifest.id,
    name: manifest.name,
    ...(manifest.defaultModel ? { defaultModel: normalizeModelPath(manifest.defaultModel) } : {}),
    ...(manifest.notations?.length
      ? {
          notations: manifest.notations
            .map((notationPath) => normalizeNotationPath(notationPath))
            .filter((notationPath, index, collection) => collection.indexOf(notationPath) === index)
        }
      : {})
  };
}

function normalizeNotationDocument(notation: NotationDocument): NotationDocument {
  return {
    id: notation.id,
    name: notation.name,
    types: notation.types.map((type) => ({
      id: type.id,
      name: type.name,
      color: type.color
    })),
    ...(notation.recommendedDrilldowns
      ? {
          recommendedDrilldowns: Object.fromEntries(
            Object.entries(notation.recommendedDrilldowns).map(([typeId, targets]) => [
              typeId,
              targets
                .map((targetPath) => normalizeModelPath(targetPath))
                .filter((targetPath, index, collection) => collection.indexOf(targetPath) === index)
            ])
          )
        }
      : {})
  };
}

function normalizeNodeLabel(rawLabel: string | undefined, fallbackIndex: number): string {
  const nextLabel = rawLabel?.trim();

  if (nextLabel) {
    return nextLabel;
  }

  return `Node ${fallbackIndex}`;
}

function normalizeEdgeNodeId(value: string, role: "source" | "target"): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new ValidationError(`Edge ${role} node is required.`);
  }

  return normalized;
}

function normalizeFrameName(rawName: string | undefined, fallbackIndex: number): string {
  const nextName = rawName?.trim();

  if (nextName) {
    return nextName;
  }

  return `Frame ${fallbackIndex}`;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizePersistedNodeDrilldowns(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("Node drilldowns must be an array.");
  }

  const nextDrilldowns: string[] = [];

  for (const candidate of value) {
    if (typeof candidate !== "string") {
      throw new ValidationError("Node drilldowns must contain only strings.");
    }

    const normalized = normalizeModelPath(candidate.trim());

    if (!nextDrilldowns.includes(normalized)) {
      nextDrilldowns.push(normalized);
    }
  }

  return nextDrilldowns;
}

function normalizePersistedNodeTyping(value: unknown): ModelNodeTyping | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isModelNodeTyping(value)) {
    throw new ValidationError("Node typing must contain typeId and colorToken.");
  }

  const definition = getNodeTypeDefinition(value.typeId.trim());

  if (!definition) {
    throw new ValidationError(`Unknown node type "${value.typeId}".`);
  }

  if (value.colorToken !== definition.colorToken) {
    throw new ValidationError(`Node type "${definition.id}" must use color token "${definition.colorToken}".`);
  }

  return {
    typeId: definition.id,
    colorToken: definition.colorToken
  };
}

function mergeNotationPaths(existingPaths: string[] | undefined, nextPath: string): string[] {
  const mergedPaths = [...(existingPaths ?? []), nextPath];

  return mergedPaths.filter((candidate, index) => mergedPaths.indexOf(candidate) === index);
}

function edgeReferencesNode(edge: ModelEdge, nodeId: string): boolean {
  return edge.source === nodeId || edge.target === nodeId;
}

function removeNodeFromFrame(frame: ModelFrame, nodeId: string): ModelFrame {
  return {
    ...frame,
    nodeIds: frame.nodeIds.filter((candidate) => candidate !== nodeId)
  };
}

function validateFrameNodeIds(value: unknown, nodes: ModelNode[]): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ValidationError("Frame nodeIds must be an array.");
  }

  const knownNodeIds = new Set(nodes.map((node) => node.id));
  const nextNodeIds: string[] = [];

  for (const candidate of value) {
    if (typeof candidate !== "string") {
      throw new ValidationError("Frame nodeIds must contain only strings.");
    }

    const normalized = candidate.trim();

    if (!normalized) {
      throw new ValidationError("Frame nodeIds must not contain empty values.");
    }

    if (!knownNodeIds.has(normalized)) {
      throw new ValidationError(`Frame node "${normalized}" does not exist.`);
    }

    if (!nextNodeIds.includes(normalized)) {
      nextNodeIds.push(normalized);
    }
  }

  return nextNodeIds;
}

function validateNodeDrilldowns(value: unknown, currentModelPath: string): string[] {
  const nextDrilldowns = normalizePersistedNodeDrilldowns(value);

  if (nextDrilldowns.includes(currentModelPath)) {
    throw new ValidationError("Node drilldowns cannot point to the current model.");
  }

  return nextDrilldowns;
}

function validateNodeTyping(value: unknown): ModelNodeTyping | null {
  if (value === null) {
    return null;
  }

  const normalizedTyping = normalizePersistedNodeTyping(value);

  if (!normalizedTyping) {
    throw new ValidationError("Node typing must contain a valid catalog type.");
  }

  return normalizedTyping;
}

function ensureNotationAllowsTyping(notation: NotationDetails, typing: ModelNodeTyping): void {
  const matchingType = notation.types.find((candidate) => candidate.id === typing.typeId);

  if (!matchingType) {
    throw new ValidationError(`Type "${typing.typeId}" is not available in notation "${notation.id}".`);
  }

  const definition = getNodeTypeDefinition(typing.typeId);

  if (!definition || matchingType.color !== definition.hexColor) {
    throw new ValidationError(`Notation "${notation.id}" does not map cleanly to the MVP type catalog.`);
  }

  if (typing.colorToken !== definition.colorToken) {
    throw new ValidationError(`Type "${typing.typeId}" must use color token "${definition.colorToken}".`);
  }
}
