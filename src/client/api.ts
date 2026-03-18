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

export async function listProjects(): Promise<ProjectSummary[]> {
  const response = await fetch("/api/projects");
  return parseResponse<{ projects: ProjectSummary[] }>(response).then((payload) => payload.projects);
}

export async function createProject(name: string): Promise<ProjectDetails> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  return parseResponse<{ project: ProjectDetails }>(response).then((payload) => payload.project);
}

export async function getProject(projectId: string): Promise<ProjectDetails> {
  const response = await fetch(`/api/projects/${projectId}`);
  return parseResponse<{ project: ProjectDetails }>(response).then((payload) => payload.project);
}

export async function getProjectTree(projectId: string): Promise<ProjectTreeNode> {
  const response = await fetch(`/api/projects/${projectId}/tree`);
  return parseResponse<{ tree: ProjectTreeNode }>(response).then((payload) => payload.tree);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unexpected request error.");
  }

  return payload;
}
