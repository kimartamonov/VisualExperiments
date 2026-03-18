import { randomUUID } from "node:crypto";
import type { Dirent } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import { ConflictError, NotFoundError, ValidationError } from "./errors.js";

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

export interface ProjectTreeNode {
  name: string;
  path: string;
  kind: "directory" | "file";
  children?: ProjectTreeNode[];
}

export interface ModelDocument {
  id: string;
  name: string;
  notation: "freeform" | string;
  nodes: unknown[];
  edges: unknown[];
  frames: unknown[];
}

export interface ModelDetails extends ModelDocument {
  path: string;
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

  async createFreeformModel(projectId: string, rawName: string, selectedPath?: string | null): Promise<ModelDetails> {
    const name = rawName.trim();

    if (!name) {
      throw new ValidationError("Model name is required.");
    }

    const context = await this.resolveProjectContext(projectId);
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
      notation: "freeform",
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
  const parsedManifest = yaml.load(rawManifest);

  if (!isProjectManifest(parsedManifest)) {
    throw new ValidationError(`Invalid project manifest at "${manifestPath}".`);
  }

  return parsedManifest;
}

async function readModel(modelPath: string): Promise<ModelDocument> {
  const rawModel = await fs.readFile(modelPath, "utf8");
  const parsedModel = yaml.load(rawModel);

  if (!isModelDocument(parsedModel)) {
    throw new ValidationError(`Invalid model document at "${modelPath}".`);
  }

  return parsedModel;
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
    Array.isArray(record.edges) &&
    Array.isArray(record.frames)
  );
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
