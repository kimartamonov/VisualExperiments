import { FormEvent, useEffect, useState } from "react";

import {
  createModel,
  createProject,
  getModel,
  getProject,
  getProjectTree,
  listProjects,
  ModelDetails,
  ProjectDetails,
  ProjectSummary,
  ProjectTreeNode
} from "./api";

function readProjectIdFromLocation(): string | null {
  const match = window.location.pathname.match(/^\/projects\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function navigateTo(pathname: string): void {
  if (window.location.pathname !== pathname) {
    window.history.pushState({}, "", pathname);
  }

  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function App() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectDetails | null>(null);
  const [projectTree, setProjectTree] = useState<ProjectTreeNode | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelDetails | null>(null);
  const [selectedTreePath, setSelectedTreePath] = useState<string>("project.yaml");
  const [projectName, setProjectName] = useState("");
  const [modelName, setModelName] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => readProjectIdFromLocation());

  useEffect(() => {
    const syncRoute = () => setActiveProjectId(readProjectIdFromLocation());

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      setCurrentProject(null);
      setProjectTree(null);
      setCurrentModel(null);
      setSelectedTreePath("project.yaml");
      return;
    }

    void openProject(activeProjectId);
  }, [activeProjectId]);

  async function loadProjects() {
    setLoadingProjects(true);

    try {
      const loadedProjects = await listProjects();
      setProjects(loadedProjects);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingProjects(false);
    }
  }

  async function openProject(projectId: string) {
    setLoadingProject(true);

    try {
      const [project, tree] = await Promise.all([getProject(projectId), getProjectTree(projectId)]);
      setCurrentProject(project);
      setProjectTree(tree);
      setError(null);

      if (project.defaultModel) {
        setSelectedTreePath(project.defaultModel);
        await openModel(projectId, project.defaultModel);
      } else {
        setSelectedTreePath("project.yaml");
        setCurrentModel(null);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingProject(false);
    }
  }

  async function openModel(projectId: string, modelPath: string) {
    setLoadingModel(true);

    try {
      const model = await getModel(projectId, modelPath);
      setCurrentModel(model);
      setSelectedTreePath(model.path);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingModel(false);
    }
  }

  async function refreshTree(nextSelectedPath?: string | null) {
    if (!activeProjectId) {
      return;
    }

    setLoadingTree(true);

    try {
      const [tree, project] = await Promise.all([getProjectTree(activeProjectId), getProject(activeProjectId)]);
      setProjectTree(tree);
      setCurrentProject(project);

      const candidatePath = nextSelectedPath ?? selectedTreePath;
      if (candidatePath && treeContainsPath(tree, candidatePath)) {
        setSelectedTreePath(candidatePath);
      } else if (project.defaultModel && treeContainsPath(tree, project.defaultModel)) {
        setSelectedTreePath(project.defaultModel);
      } else {
        setSelectedTreePath("project.yaml");
      }

      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingTree(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingProject(true);

    try {
      const project = await createProject(projectName);
      setProjects((current) => sortProjects([...current, project]));
      setProjectName("");
      setError(null);
      navigateTo(`/projects/${project.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmittingProject(false);
    }
  }

  async function handleCreateModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProjectId) {
      return;
    }

    setSubmittingModel(true);

    try {
      const model = await createModel(activeProjectId, modelName, selectedTreePath);
      setModelName("");
      await Promise.all([refreshTree(model.path), openModel(activeProjectId, model.path), loadProjects()]);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmittingModel(false);
    }
  }

  function handleTreeSelect(node: ProjectTreeNode) {
    const nextPath = node.path || "project-root";
    setSelectedTreePath(nextPath);

    if (activeProjectId && isModelFilePath(nextPath)) {
      void openModel(activeProjectId, nextPath);
      return;
    }

    if (!isModelFilePath(nextPath)) {
      setCurrentModel((existing) => {
        if (existing && existing.path === nextPath) {
          return null;
        }

        return existing;
      });
    }
  }

  return (
    <div className="screen-shell">
      <section className="browser-panel">
        <div className="eyebrow">M2-01 · Freeform bootstrap</div>
        <h1>VisualExperiments</h1>
        <p className="lede">
          Create a real project, open its workspace, and bootstrap the first freeform model directly from the
          file tree.
        </p>

        <form className="project-form" onSubmit={handleCreateProject}>
          <label htmlFor="projectName">New project name</label>
          <div className="form-row">
            <input
              id="projectName"
              name="projectName"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Business Model Canvas"
              autoComplete="off"
            />
            <button type="submit" disabled={submittingProject}>
              {submittingProject ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>

        <div className="list-header">
          <h2>Projects</h2>
          <button type="button" className="ghost-button" onClick={() => void loadProjects()} disabled={loadingProjects}>
            {loadingProjects ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loadingProjects ? <p className="status">Loading projects...</p> : null}

        {!loadingProjects && projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create the first one to bootstrap a folder with <code>project.yaml</code>, <code>models/</code>, and your first freeform model.</p>
          </div>
        ) : null}

        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id} className={`project-card ${currentProject?.id === project.id ? "project-card-active" : ""}`}>
              <div>
                <strong>{project.name}</strong>
                <p>{project.folderName}</p>
              </div>
              <button type="button" onClick={() => navigateTo(`/projects/${project.id}`)}>
                Open
              </button>
            </li>
          ))}
        </ul>

        {error ? <div className="error-banner">{error}</div> : null}
      </section>

      <section className="workspace-panel">
        {loadingProject ? <p className="status">Opening project...</p> : null}

        {!loadingProject && !currentProject ? (
          <div className="workspace-placeholder">
            <h2>Workspace shell will appear here</h2>
            <p>Select a project from the list or create a new one to enter the freeform workspace.</p>
          </div>
        ) : null}

        {!loadingProject && currentProject ? (
          <article className="workspace-shell">
            <div className="workspace-toolbar">
              <div>
                <div className="eyebrow">Project open</div>
                <h2>{currentProject.name}</h2>
                <p className="workspace-copy">
                  Create a freeform model from the current directory context or open an existing YAML model from
                  the tree. The center panel now acts as the empty canvas bootstrap.
                </p>
              </div>
              <div className="toolbar-actions">
                <button type="button" className="ghost-button" onClick={() => navigateTo("/")}>
                  Back to projects
                </button>
                <button type="button" className="ghost-button" onClick={() => void refreshTree()} disabled={loadingTree}>
                  {loadingTree ? "Refreshing..." : "Refresh tree"}
                </button>
              </div>
            </div>

            <div className="three-panel-layout">
              <section className="shell-panel">
                <div className="panel-header">
                  <span className="panel-kicker">Left panel</span>
                  <h3>Project tree</h3>
                </div>
                <p className="panel-copy">
                  Create the next model in the selected folder context, or click an existing model YAML file to open it.
                </p>

                <form className="model-form" onSubmit={handleCreateModel}>
                  <label htmlFor="modelName">New freeform model</label>
                  <div className="form-row">
                    <input
                      id="modelName"
                      name="modelName"
                      value={modelName}
                      onChange={(event) => setModelName(event.target.value)}
                      placeholder="Main Map"
                      autoComplete="off"
                    />
                    <button type="submit" disabled={submittingModel}>
                      {submittingModel ? "Creating..." : "Create model"}
                    </button>
                  </div>
                  <p className="form-hint">Current target: {describeCreationTarget(selectedTreePath)}</p>
                </form>

                {projectTree ? (
                  <TreeView
                    node={projectTree}
                    selectedPath={selectedTreePath}
                    onSelectNode={handleTreeSelect}
                  />
                ) : (
                  <p className="status">Loading tree...</p>
                )}
              </section>

              <section className="shell-panel shell-panel-center">
                <div className="panel-header">
                  <span className="panel-kicker">Center panel</span>
                  <h3>{currentModel ? "Empty freeform canvas" : "Canvas waiting for model"}</h3>
                </div>
                <div className="placeholder-surface">
                  {!currentModel ? (
                    <>
                      <p>
                        Create the first freeform model to bootstrap the editor. Once created, the model opens here
                        with an intentionally empty canvas surface ready for node editing in `M2-02`.
                      </p>
                      <div className="canvas-surface canvas-surface-empty">
                        <div className="canvas-badge">No model open</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        The model is now open with `notation: freeform` and explicit empty collections. This panel
                        stays intentionally minimal until graph editing arrives in the next issue.
                      </p>
                      <div className="selection-card">
                        <span className="selection-label">Opened model</span>
                        <strong>{currentModel.name}</strong>
                        <span className="selection-path">{currentModel.path}</span>
                      </div>
                      <div className="canvas-surface">
                        <div className="canvas-badge">notation: {currentModel.notation}</div>
                        <div className="canvas-grid">
                          <div className="canvas-node-placeholder">Empty canvas</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="shell-panel">
                <div className="panel-header">
                  <span className="panel-kicker">Right panel</span>
                  <h3>{currentModel ? "Model properties" : "Project properties"}</h3>
                </div>
                <div className="properties-stack">
                  {!currentModel ? (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Project root</span>
                        <strong>{currentProject.projectRootName}/</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Default model</span>
                        <strong>{currentProject.defaultModel ?? "Not set yet"}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Selected path</span>
                        <strong>{formatSelectedPath(selectedTreePath)}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Model ID</span>
                        <strong>{currentModel.id}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Notation</span>
                        <strong>{currentModel.notation}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Collections</span>
                        <strong>
                          nodes {currentModel.nodes.length} · edges {currentModel.edges.length} · frames {currentModel.frames.length}
                        </strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Model path</span>
                        <strong>{currentModel.path}</strong>
                      </div>
                    </>
                  )}
                  {loadingModel ? <p className="status">Loading model...</p> : null}
                </div>
              </section>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}

interface TreeViewProps {
  node: ProjectTreeNode;
  selectedPath: string;
  onSelectNode: (node: ProjectTreeNode) => void;
}

function TreeView({ node, selectedPath, onSelectNode }: TreeViewProps) {
  return (
    <ul className="tree-list">
      <TreeNodeView node={node} selectedPath={selectedPath} onSelectNode={onSelectNode} depth={0} />
    </ul>
  );
}

interface TreeNodeViewProps extends TreeViewProps {
  depth: number;
}

function TreeNodeView({ node, selectedPath, onSelectNode, depth }: TreeNodeViewProps) {
  const selectionPath = node.path || "project-root";
  const isSelected = selectedPath === selectionPath;
  const icon = node.kind === "directory" ? "[dir]" : "[yml]";

  return (
    <li>
      <button
        type="button"
        className={`tree-node ${isSelected ? "tree-node-selected" : ""}`}
        style={{ paddingLeft: `${16 + depth * 14}px` }}
        onClick={() => onSelectNode(node)}
      >
        <span className="tree-icon">{icon}</span>
        <span>{node.path ? node.name : `${node.name}/`}</span>
        {isSelected ? <span className="tree-current">Current</span> : null}
      </button>
      {node.kind === "directory" && node.children?.length ? (
        <ul className="tree-list">
          {node.children.map((child) => (
            <TreeNodeView
              key={`${selectionPath}-${child.path}`}
              node={child}
              selectedPath={selectedPath}
              onSelectNode={onSelectNode}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected application error.";
}

function sortProjects(projects: ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort((left, right) => left.name.localeCompare(right.name));
}

function treeContainsPath(node: ProjectTreeNode, path: string): boolean {
  const normalizedPath = node.path || "project-root";

  if (normalizedPath === path) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, path)) ?? false;
}

function formatSelectedPath(path: string): string {
  return path === "project-root" ? "/" : path;
}

function isModelFilePath(path: string): boolean {
  return path !== "project.yaml" && path.endsWith(".yaml");
}

function describeCreationTarget(path: string): string {
  if (!path || path === "project-root" || path === "project.yaml") {
    return "models/ (or models/main.yaml for the first model)";
  }

  return formatSelectedPath(path);
}
