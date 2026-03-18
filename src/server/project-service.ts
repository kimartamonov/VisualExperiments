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
    const record = await this.findProjectRecord(projectId);
    const projectRoot = path.join(this.projectsRoot, record.folderName);

    return this.readTree(projectRoot, "");
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
  return `${yaml.dump(manifest, {
    noRefs: true,
    sortKeys: false,
    lineWidth: -1
  }).trimEnd()}\n`;
}

async function readManifest(manifestPath: string): Promise<ProjectManifest> {
  const rawManifest = await fs.readFile(manifestPath, "utf8");
  const parsedManifest = yaml.load(rawManifest);

  if (!isProjectManifest(parsedManifest)) {
    throw new ValidationError(`Invalid project manifest at "${manifestPath}".`);
  }

  return parsedManifest;
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
