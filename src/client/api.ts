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

export interface ModelNodePosition {
  x: number;
  y: number;
}

export interface ModelNode {
  id: string;
  label: string;
  description: string;
  position: ModelNodePosition;
}

export interface ModelEdge {
  id: string;
  source: string;
  target: string;
}

export interface ModelFrame {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  stepUp: null;
}

export interface ModelDetails {
  id: string;
  path: string;
  name: string;
  notation: string;
  nodes: ModelNode[];
  edges: ModelEdge[];
  frames: ModelFrame[];
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

export async function createModel(projectId: string, name: string, selectedPath: string | null): Promise<ModelDetails> {
  const response = await fetch(`/api/projects/${projectId}/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, selectedPath })
  });

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function getModel(projectId: string, modelPath: string): Promise<ModelDetails> {
  const response = await fetch(`/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);
  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function createNode(
  projectId: string,
  modelPath: string,
  position: ModelNodePosition,
  label?: string
): Promise<{ model: ModelDetails; node: ModelNode }> {
  const response = await fetch(`/api/projects/${projectId}/nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, position, label })
  });

  return parseResponse<{ model: ModelDetails; node: ModelNode }>(response);
}

export async function updateNode(
  projectId: string,
  modelPath: string,
  nodeId: string,
  patch: Partial<Pick<ModelNode, "label" | "description" | "position">>
): Promise<ModelDetails> {
  const response = await fetch(`/api/projects/${projectId}/nodes/${encodeURIComponent(nodeId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...patch })
  });

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function deleteNode(projectId: string, modelPath: string, nodeId: string): Promise<ModelDetails> {
  const response = await fetch(
    `/api/projects/${projectId}/nodes/${encodeURIComponent(nodeId)}?path=${encodeURIComponent(modelPath)}`,
    {
      method: "DELETE"
    }
  );

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function createEdge(
  projectId: string,
  modelPath: string,
  source: string,
  target: string
): Promise<{ model: ModelDetails; edge: ModelEdge }> {
  const response = await fetch(`/api/projects/${projectId}/edges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, source, target })
  });

  return parseResponse<{ model: ModelDetails; edge: ModelEdge }>(response);
}

export async function deleteEdge(projectId: string, modelPath: string, edgeId: string): Promise<ModelDetails> {
  const response = await fetch(
    `/api/projects/${projectId}/edges/${encodeURIComponent(edgeId)}?path=${encodeURIComponent(modelPath)}`,
    {
      method: "DELETE"
    }
  );

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function createFrame(
  projectId: string,
  modelPath: string,
  payload?: Partial<Pick<ModelFrame, "name" | "description" | "nodeIds">>
): Promise<{ model: ModelDetails; frame: ModelFrame }> {
  const response = await fetch(`/api/projects/${projectId}/frames`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...payload })
  });

  return parseResponse<{ model: ModelDetails; frame: ModelFrame }>(response);
}

export async function updateFrame(
  projectId: string,
  modelPath: string,
  frameId: string,
  patch: Partial<Pick<ModelFrame, "name" | "description" | "nodeIds">>
): Promise<ModelDetails> {
  const response = await fetch(`/api/projects/${projectId}/frames/${encodeURIComponent(frameId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...patch })
  });

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

export async function deleteFrame(projectId: string, modelPath: string, frameId: string): Promise<ModelDetails> {
  const response = await fetch(
    `/api/projects/${projectId}/frames/${encodeURIComponent(frameId)}?path=${encodeURIComponent(modelPath)}`,
    {
      method: "DELETE"
    }
  );

  return parseResponse<{ model: ModelDetails }>(response).then((payload) => payload.model);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unexpected request error.");
  }

  return payload;
}
