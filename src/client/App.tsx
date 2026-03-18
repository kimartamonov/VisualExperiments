import { FormEvent, useEffect, useState } from "react";

import {
  createProject,
  getProject,
  getProjectTree,
  listProjects,
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
  const [selectedTreePath, setSelectedTreePath] = useState<string>("project.yaml");
  const [projectName, setProjectName] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      setSelectedTreePath("project.yaml");
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingProject(false);
    }
  }

  async function refreshTree() {
    if (!activeProjectId) {
      return;
    }

    setLoadingTree(true);

    try {
      const tree = await getProjectTree(activeProjectId);
      setProjectTree(tree);

      if (selectedTreePath && !treeContainsPath(tree, selectedTreePath)) {
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
    setSubmitting(true);

    try {
      const project = await createProject(projectName);
      setProjects((current) => sortProjects([...current, project]));
      setProjectName("");
      setError(null);
      navigateTo(`/projects/${project.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen-shell">
      <section className="browser-panel">
        <div className="eyebrow">M1-03 · Workspace shell</div>
        <h1>VisualExperiments</h1>
        <p className="lede">
          Create a project, open it, and inspect the real file structure through a stable three-panel
          workspace shell.
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
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create project"}
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
            <p>Create the first one to bootstrap a folder with <code>project.yaml</code> and <code>models/</code>.</p>
          </div>
        ) : null}

        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id} className="project-card">
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
            <p>Select a project from the list or create a new one to enter the file-tree workspace.</p>
          </div>
        ) : null}

        {!loadingProject && currentProject ? (
          <article className="workspace-shell">
            <div className="workspace-toolbar">
              <div>
                <div className="eyebrow">Project open</div>
                <h2>{currentProject.name}</h2>
                <p className="workspace-copy">
                  The project is open in a stable shell. The left panel reflects the actual file system, while
                  the center and right panels stay as intentional placeholders for later modeling work.
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
                <p className="panel-copy">Folders and YAML files are rendered directly from the backend tree API.</p>
                {projectTree ? (
                  <TreeView
                    node={projectTree}
                    selectedPath={selectedTreePath}
                    onSelectPath={setSelectedTreePath}
                  />
                ) : (
                  <p className="status">Loading tree...</p>
                )}
              </section>

              <section className="shell-panel shell-panel-center">
                <div className="panel-header">
                  <span className="panel-kicker">Center panel</span>
                  <h3>Canvas placeholder</h3>
                </div>
                <div className="placeholder-surface">
                  <p>
                    `M1-03` stops at shell readiness. Tree selection already gives a stable target for later
                    model-opening work without pulling canvas behavior into the wrong issue.
                  </p>
                  <div className="selection-card">
                    <span className="selection-label">Selected path</span>
                    <strong>{formatSelectedPath(selectedTreePath)}</strong>
                  </div>
                  <ul className="structure-list">
                    <li>Project ID: {currentProject.id}</li>
                    <li>Default model: {currentProject.defaultModel ?? "Not set yet"}</li>
                    <li>Has models: {currentProject.hasModels ? "Yes" : "No"}</li>
                  </ul>
                </div>
              </section>

              <section className="shell-panel">
                <div className="panel-header">
                  <span className="panel-kicker">Right panel</span>
                  <h3>Properties placeholder</h3>
                </div>
                <div className="properties-stack">
                  <div className="property-card">
                    <span className="selection-label">Project root</span>
                    <strong>{currentProject.projectRootName}/</strong>
                  </div>
                  <div className="property-card">
                    <span className="selection-label">Manifest</span>
                    <strong>{currentProject.manifestPath}</strong>
                  </div>
                  <div className="property-card">
                    <span className="selection-label">Models folder</span>
                    <strong>{currentProject.modelsPath}</strong>
                  </div>
                  <p className="workspace-copy">
                    This panel is reserved for model and object properties. In `M1-03` it proves the shell
                    layout and keeps current project context stable through redraw and refresh.
                  </p>
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
  onSelectPath: (path: string) => void;
}

function TreeView({ node, selectedPath, onSelectPath }: TreeViewProps) {
  return (
    <ul className="tree-list">
      <TreeNodeView node={node} selectedPath={selectedPath} onSelectPath={onSelectPath} depth={0} />
    </ul>
  );
}

interface TreeNodeViewProps extends TreeViewProps {
  depth: number;
}

function TreeNodeView({ node, selectedPath, onSelectPath, depth }: TreeNodeViewProps) {
  const selectionPath = node.path || "project-root";
  const isSelected = selectedPath === selectionPath;

  return (
    <li>
      <button
        type="button"
        className={`tree-node ${isSelected ? "tree-node-selected" : ""}`}
        style={{ paddingLeft: `${16 + depth * 14}px` }}
        onClick={() => onSelectPath(selectionPath)}
      >
        <span className="tree-icon">{node.kind === "directory" ? "▾" : "•"}</span>
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
              onSelectPath={onSelectPath}
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
