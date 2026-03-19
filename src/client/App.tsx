import { FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

import {
  createEdge,
  createFrame,
  createModel,
  createNode,
  createProject,
  deleteEdge,
  deleteFrame,
  deleteNode,
  FrameStepUpMode,
  getModel,
  getProject,
  getProjectTree,
  listProjects,
  ModelDetails,
  ModelFrame,
  ModelNode,
  ModelNodePosition,
  ProjectDetails,
  ProjectSummary,
  ProjectTreeNode,
  stepUpFrame,
  updateFrame,
  updateNode
} from "./api";
import {
  canNavigateBack,
  createNavigationState,
  dropNavigationTarget,
  getNavigationBreadcrumbs,
  NavigationOpenMode,
  NavigationState,
  navigateBack,
  navigateToBreadcrumb,
  openNavigationTarget,
  toNavigationTarget
} from "../shared/navigation";

interface DragState {
  nodeId: string;
  pointerOrigin: ModelNodePosition;
  startPosition: ModelNodePosition;
  nextPosition: ModelNodePosition;
}

interface FrameBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OpenModelOptions {
  navigationMode?: NavigationOpenMode;
  nextNavigationState?: NavigationState;
  failureMode?: "keep-current" | "clear-current";
  pruneFailedTarget?: boolean;
  failureLabel?: string;
}

interface DrilldownRecoveryState {
  nodeId: string;
  targetPath: string;
}

interface StepUpRecoveryState {
  frameId: string;
  targetPath: string;
}

const NODE_WIDTH = 176;
const NODE_HEIGHT = 104;

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
  const [navigationState, setNavigationState] = useState<NavigationState>(() => createNavigationState());
  const [selectedTreePath, setSelectedTreePath] = useState<string>("project.yaml");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [edgeCreationSourceId, setEdgeCreationSourceId] = useState<string | null>(null);
  const [nodeLabelDraft, setNodeLabelDraft] = useState("");
  const [nodeDescriptionDraft, setNodeDescriptionDraft] = useState("");
  const [frameNameDraft, setFrameNameDraft] = useState("");
  const [frameDescriptionDraft, setFrameDescriptionDraft] = useState("");
  const [frameNodeIdsDraft, setFrameNodeIdsDraft] = useState<string[]>([]);
  const [existingDrilldownTargetPath, setExistingDrilldownTargetPath] = useState("");
  const [projectName, setProjectName] = useState("");
  const [modelName, setModelName] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submittingModel, setSubmittingModel] = useState(false);
  const [mutatingNodeId, setMutatingNodeId] = useState<string | null>(null);
  const [mutatingEdgeId, setMutatingEdgeId] = useState<string | null>(null);
  const [mutatingFrameId, setMutatingFrameId] = useState<string | null>(null);
  const [mutatingDrilldownNodeId, setMutatingDrilldownNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [drilldownRecovery, setDrilldownRecovery] = useState<DrilldownRecoveryState | null>(null);
  const [stepUpRecovery, setStepUpRecovery] = useState<StepUpRecoveryState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => readProjectIdFromLocation());
  const activeProjectIdRef = useRef<string | null>(activeProjectId);
  const currentModelRef = useRef<ModelDetails | null>(currentModel);
  const dragStateRef = useRef<DragState | null>(null);

  const selectedNode = currentModel?.nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = currentModel?.edges.find((edge) => edge.id === selectedEdgeId) ?? null;
  const selectedFrame = currentModel?.frames.find((frame) => frame.id === selectedFrameId) ?? null;
  const availableDrilldownTargets =
    currentModel && projectTree
      ? collectModelPaths(projectTree).filter(
          (candidate) => candidate !== currentModel.path && !(selectedNode?.drilldowns ?? []).includes(candidate)
        )
      : [];
  const navigationBreadcrumbs = getNavigationBreadcrumbs(navigationState);
  const canGoBack = canNavigateBack(navigationState);
  const selectedNodeMissingDrilldown =
    selectedNode?.drilldowns.find((candidate) => !projectTree || !treeContainsPath(projectTree, candidate)) ?? null;
  const selectedNodeRecoveryTarget =
    drilldownRecovery?.nodeId === selectedNode?.id ? drilldownRecovery?.targetPath ?? null : selectedNodeMissingDrilldown;
  const selectedFrameMissingStepUp =
    selectedFrame?.stepUp && (!projectTree || !treeContainsPath(projectTree, selectedFrame.stepUp.model))
      ? selectedFrame.stepUp.model
      : null;
  const selectedFrameRecoveryTarget =
    stepUpRecovery?.frameId === selectedFrame?.id ? stepUpRecovery?.targetPath ?? null : selectedFrameMissingStepUp;

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    currentModelRef.current = currentModel;
  }, [currentModel]);

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
      setNavigationState(createNavigationState());
      setSelectedTreePath("project.yaml");
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setEdgeCreationSourceId(null);
      return;
    }

    void openProject(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (!currentModel) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setEdgeCreationSourceId(null);
      return;
    }

    if (selectedNodeId && !currentModel.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }

    if (selectedEdgeId && !currentModel.edges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }

    if (selectedFrameId && !currentModel.frames.some((frame) => frame.id === selectedFrameId)) {
      setSelectedFrameId(null);
    }

    if (edgeCreationSourceId && !currentModel.nodes.some((node) => node.id === edgeCreationSourceId)) {
      setEdgeCreationSourceId(null);
    }
  }, [currentModel, selectedNodeId, selectedEdgeId, selectedFrameId, edgeCreationSourceId]);

  useEffect(() => {
    setNodeLabelDraft(selectedNode?.label ?? "");
    setNodeDescriptionDraft(selectedNode?.description ?? "");
  }, [selectedNode?.id, selectedNode?.label, selectedNode?.description]);

  useEffect(() => {
    setFrameNameDraft(selectedFrame?.name ?? "");
    setFrameDescriptionDraft(selectedFrame?.description ?? "");
    setFrameNodeIdsDraft(selectedFrame?.nodeIds ?? []);
  }, [selectedFrame?.id, selectedFrame?.name, selectedFrame?.description, selectedFrame?.nodeIds]);

  useEffect(() => {
    setDrilldownRecovery((current) => (current && current.nodeId === selectedNode?.id ? current : null));
  }, [selectedNode?.id]);

  useEffect(() => {
    setStepUpRecovery((current) => (current && current.frameId === selectedFrame?.id ? current : null));
  }, [selectedFrame?.id]);

  useEffect(() => {
    if (!selectedNode) {
      setExistingDrilldownTargetPath("");
      return;
    }

    if (
      existingDrilldownTargetPath &&
      availableDrilldownTargets.includes(existingDrilldownTargetPath)
    ) {
      return;
    }

    setExistingDrilldownTargetPath(availableDrilldownTargets[0] ?? "");
  }, [selectedNode?.id, existingDrilldownTargetPath, availableDrilldownTargets]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;

      if (!dragState) {
        return;
      }

      const nextPosition = {
        x: roundCoordinate(Math.max(16, dragState.startPosition.x + (event.clientX - dragState.pointerOrigin.x))),
        y: roundCoordinate(Math.max(16, dragState.startPosition.y + (event.clientY - dragState.pointerOrigin.y)))
      };

      dragStateRef.current = {
        ...dragState,
        nextPosition
      };

      setCurrentModel((existing) => updateModelNodePosition(existing, dragState.nodeId, nextPosition));
    };

    const handlePointerUp = () => {
      const dragState = dragStateRef.current;

      if (!dragState) {
        return;
      }

      dragStateRef.current = null;
      setDraggingNodeId(null);

      if (
        dragState.nextPosition.x === dragState.startPosition.x &&
        dragState.nextPosition.y === dragState.startPosition.y
      ) {
        return;
      }

      void persistNodePatch(dragState.nodeId, { position: dragState.nextPosition }, true);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

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

  function clearCurrentWorkspaceSelection(nextSelectedPath = "project.yaml") {
    setCurrentModel(null);
    setNavigationState(createNavigationState());
    setSelectedTreePath(nextSelectedPath);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedFrameId(null);
    setEdgeCreationSourceId(null);
    setExistingDrilldownTargetPath("");
    setDrilldownRecovery(null);
    setStepUpRecovery(null);
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
        const opened = await openModel(projectId, project.defaultModel, {
          navigationMode: "reset",
          failureMode: "clear-current",
          pruneFailedTarget: false,
          failureLabel: `default model ${formatSelectedPath(project.defaultModel)}`
        });

        if (!opened) {
          setSelectedTreePath(treeContainsPath(tree, project.defaultModel) ? project.defaultModel : "project.yaml");
        }
      } else {
        clearCurrentWorkspaceSelection();
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingProject(false);
    }
  }

  async function openModel(projectId: string, modelPath: string, options: OpenModelOptions = {}) {
    setLoadingModel(true);

    try {
      const model = await getModel(projectId, modelPath);
      setCurrentModel(model);
      setNavigationState((existing) =>
        options.nextNavigationState
          ? {
              stack: options.nextNavigationState.stack,
              current: toNavigationTarget(model.path, model.name)
            }
          : openNavigationTarget(existing, toNavigationTarget(model.path, model.name), options.navigationMode ?? "push")
      );
      setSelectedTreePath(model.path);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setEdgeCreationSourceId(null);
      setError(null);
      return true;
    } catch (requestError) {
      if (options.failureMode === "clear-current") {
        clearCurrentWorkspaceSelection();
      } else {
        setSelectedTreePath(currentModelRef.current?.path ?? "project.yaml");

        if (options.pruneFailedTarget) {
          setNavigationState((existing) => dropNavigationTarget(existing, modelPath));
        }
      }

      setError(buildModelOpenErrorMessage(options.failureLabel ?? formatSelectedPath(modelPath), requestError, options.failureMode));
      return false;
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
      setProjects((existing) => sortProjects([...existing, project]));
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
      await Promise.all([
        refreshTree(model.path),
        openModel(activeProjectId, model.path, {
          navigationMode: "push",
          failureMode: "keep-current",
          pruneFailedTarget: false,
          failureLabel: `new model ${formatSelectedPath(model.path)}`
        }),
        loadProjects()
      ]);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmittingModel(false);
    }
  }

  async function handleCreateNode(position?: ModelNodePosition) {
    if (!activeProjectId || !currentModel) {
      return;
    }

    setMutatingNodeId("creating-node");

    try {
      const result = await createNode(
        activeProjectId,
        currentModel.path,
        position ?? getDefaultNodePosition(currentModel.nodes.length)
      );
      setCurrentModel(result.model);
      setSelectedNodeId(result.node.id);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingNodeId(null);
    }
  }

  async function handleSaveNodeDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedNode) {
      return;
    }

    await persistNodePatch(selectedNode.id, {
      label: nodeLabelDraft,
      description: nodeDescriptionDraft
    });
  }

  async function handleDeleteSelectedNode() {
    if (!activeProjectId || !currentModel || !selectedNode) {
      return;
    }

    setMutatingNodeId(selectedNode.id);

    try {
      const model = await deleteNode(activeProjectId, currentModel.path, selectedNode.id);
      setCurrentModel(model);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setEdgeCreationSourceId((current) => (current === selectedNode.id ? null : current));
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingNodeId(null);
    }
  }

  async function handleCreateEdge(targetNodeId: string) {
    const projectId = activeProjectIdRef.current;
    const model = currentModelRef.current;
    const sourceNodeId = edgeCreationSourceId;

    if (!projectId || !model || !sourceNodeId) {
      return;
    }

    if (sourceNodeId === targetNodeId) {
      setError("Choose a different target node to create a directed edge.");
      return;
    }

    setMutatingEdgeId("creating-edge");

    try {
      const result = await createEdge(projectId, model.path, sourceNodeId, targetNodeId);
      setCurrentModel(result.model);
      setSelectedNodeId(null);
      setSelectedEdgeId(result.edge.id);
      setSelectedFrameId(null);
      setEdgeCreationSourceId(null);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingEdgeId(null);
    }
  }

  async function handleDeleteSelectedEdge() {
    if (!activeProjectId || !currentModel || !selectedEdge) {
      return;
    }

    setMutatingEdgeId(selectedEdge.id);

    try {
      const model = await deleteEdge(activeProjectId, currentModel.path, selectedEdge.id);
      setCurrentModel(model);
      setSelectedEdgeId(null);
      setSelectedFrameId(null);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingEdgeId(null);
    }
  }

  async function handleCreateFrame() {
    if (!activeProjectId || !currentModel) {
      return;
    }

    setMutatingFrameId("creating-frame");

    try {
      const result = await createFrame(activeProjectId, currentModel.path);
      setCurrentModel(result.model);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedFrameId(result.frame.id);
      setEdgeCreationSourceId(null);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingFrameId(null);
    }
  }

  async function handleSaveFrameDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProjectId || !currentModel || !selectedFrame) {
      return;
    }

    setMutatingFrameId(selectedFrame.id);

    try {
      const model = await updateFrame(activeProjectId, currentModel.path, selectedFrame.id, {
        name: frameNameDraft,
        description: frameDescriptionDraft,
        nodeIds: frameNodeIdsDraft
      });
      setCurrentModel(model);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingFrameId(null);
    }
  }

  async function handleDeleteSelectedFrame() {
    if (!activeProjectId || !currentModel || !selectedFrame) {
      return;
    }

    setMutatingFrameId(selectedFrame.id);

    try {
      const model = await deleteFrame(activeProjectId, currentModel.path, selectedFrame.id);
      setCurrentModel(model);
      setSelectedFrameId(null);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingFrameId(null);
    }
  }

  async function persistNodePatch(
    nodeId: string,
    patch: Partial<Pick<ModelNode, "label" | "description" | "position" | "drilldowns">>,
    shouldRecoverOnError = false
  ) {
    const projectId = activeProjectIdRef.current;
    const model = currentModelRef.current;

    if (!projectId || !model) {
      return;
    }

    setMutatingNodeId(nodeId);

    try {
      const updatedModel = await updateNode(projectId, model.path, nodeId, patch);
      setCurrentModel(updatedModel);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));

      if (shouldRecoverOnError) {
        await openModel(projectId, model.path, {
          navigationMode: "refresh",
          failureMode: "keep-current",
          pruneFailedTarget: false,
          failureLabel: `current model ${formatSelectedPath(model.path)}`
        });
      }
    } finally {
      setMutatingNodeId(null);
    }
  }

  function handleTreeSelect(node: ProjectTreeNode) {
    const nextPath = node.path || "project-root";
    setSelectedTreePath(nextPath);

    if (activeProjectId && isModelFilePath(nextPath)) {
      void openModel(activeProjectId, nextPath, {
        navigationMode: "push",
        failureMode: "keep-current",
        pruneFailedTarget: false,
        failureLabel: `model ${formatSelectedPath(nextPath)}`
      });
    }
  }

  async function handleCreateDrilldownModel(replacePath?: string) {
    if (!activeProjectId || !currentModel || !selectedNode) {
      return;
    }

    setMutatingDrilldownNodeId(selectedNode.id);

    try {
      const childModel = await createModel(
        activeProjectId,
        buildDrilldownModelName(selectedNode.label),
        currentModel.path
      );
      const updatedModel = await updateNode(activeProjectId, currentModel.path, selectedNode.id, {
        drilldowns: mergeDrilldownPaths(selectedNode.drilldowns, childModel.path, replacePath)
      });

      setCurrentModel(updatedModel);
      setDrilldownRecovery(null);
      await Promise.all([refreshTree(childModel.path), loadProjects()]);
      await openModel(activeProjectId, childModel.path, {
        navigationMode: "push",
        failureMode: "keep-current",
        pruneFailedTarget: false,
        failureLabel: `drill-down ${formatSelectedPath(childModel.path)}`
      });
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingDrilldownNodeId(null);
    }
  }

  async function handleLinkExistingDrilldown(replacePath?: string) {
    if (!activeProjectId || !currentModel || !selectedNode) {
      return;
    }

    const targetPath = replacePath ?? existingDrilldownTargetPath;

    if (!targetPath) {
      setError("Choose an existing model to link as a drill-down target.");
      return;
    }

    setMutatingDrilldownNodeId(selectedNode.id);

    try {
      const updatedModel = await updateNode(activeProjectId, currentModel.path, selectedNode.id, {
        drilldowns: mergeDrilldownPaths(selectedNode.drilldowns, targetPath, replacePath)
      });

      setCurrentModel(updatedModel);
      setDrilldownRecovery(null);
      const opened = await openModel(activeProjectId, targetPath, {
        navigationMode: "push",
        failureMode: "keep-current",
        pruneFailedTarget: false,
        failureLabel: `drill-down ${formatSelectedPath(targetPath)}`
      });

      if (!opened) {
        setDrilldownRecovery({
          nodeId: selectedNode.id,
          targetPath
        });
      } else {
        setError(null);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setMutatingDrilldownNodeId(null);
    }
  }

  async function handleOpenDrilldown(targetPath: string) {
    if (!activeProjectId || !selectedNode) {
      return;
    }

    const opened = await openModel(activeProjectId, targetPath, {
      navigationMode: "push",
      failureMode: "keep-current",
      pruneFailedTarget: false,
      failureLabel: `drill-down ${formatSelectedPath(targetPath)}`
    });

    if (!opened) {
      setDrilldownRecovery({
        nodeId: selectedNode.id,
        targetPath
      });
      return;
    }

    setDrilldownRecovery(null);
  }

  async function handleFrameStepUp(mode: FrameStepUpMode = "default") {
    if (!activeProjectId || !currentModel || !selectedFrame) {
      return;
    }

    setMutatingFrameId(selectedFrame.id);
    let targetPath = selectedFrame.stepUp?.model ?? null;

    try {
      const result = await stepUpFrame(activeProjectId, currentModel.path, selectedFrame.id, mode);
      targetPath = result.link.model;
      setCurrentModel(result.sourceModel);
      setStepUpRecovery(null);
      await refreshTree(targetPath);
      const opened = await openModel(activeProjectId, targetPath, {
        navigationMode: "push",
        failureMode: "keep-current",
        pruneFailedTarget: false,
        failureLabel: `step-up ${formatSelectedPath(targetPath)}`
      });

      if (!opened) {
        setStepUpRecovery({
          frameId: selectedFrame.id,
          targetPath
        });
        return;
      }

      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));

      if (targetPath) {
        setStepUpRecovery({
          frameId: selectedFrame.id,
          targetPath
        });
      }
    } finally {
      setMutatingFrameId(null);
    }
  }

  async function handleOpenFrameStepUp() {
    if (!activeProjectId || !selectedFrame?.stepUp) {
      return;
    }

    const targetPath = selectedFrame.stepUp.model;
    const opened = await openModel(activeProjectId, targetPath, {
      navigationMode: "push",
      failureMode: "keep-current",
      pruneFailedTarget: false,
      failureLabel: `step-up ${formatSelectedPath(targetPath)}`
    });

    if (!opened) {
      setStepUpRecovery({
        frameId: selectedFrame.id,
        targetPath
      });
      return;
    }

    setStepUpRecovery(null);
    setError(null);
  }

  async function handleNavigateBack() {
    if (!activeProjectId) {
      return;
    }

    const nextNavigation = navigateBack(navigationState);

    if (!nextNavigation.target) {
      return;
    }

    await openModel(activeProjectId, nextNavigation.target.modelPath, {
      nextNavigationState: nextNavigation.state,
      failureMode: "keep-current",
      pruneFailedTarget: true,
      failureLabel: `back target ${formatSelectedPath(nextNavigation.target.modelPath)}`
    });
  }

  async function handleNavigateBreadcrumb(modelPath: string) {
    if (!activeProjectId || currentModel?.path === modelPath) {
      return;
    }

    const nextNavigation = navigateToBreadcrumb(navigationState, modelPath);

    if (!nextNavigation.target) {
      return;
    }

    await openModel(activeProjectId, nextNavigation.target.modelPath, {
      nextNavigationState: nextNavigation.state,
      failureMode: "keep-current",
      pruneFailedTarget: true,
      failureLabel: `breadcrumb ${formatSelectedPath(nextNavigation.target.modelPath)}`
    });
  }

  function handleCanvasDoubleClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (!currentModel) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const nextPosition = {
      x: clampPosition(event.clientX - bounds.left - NODE_WIDTH / 2, bounds.width, NODE_WIDTH),
      y: clampPosition(event.clientY - bounds.top - NODE_HEIGHT / 2, bounds.height, NODE_HEIGHT)
    };

    void handleCreateNode(nextPosition);
  }

  function handleCanvasClick() {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedFrameId(null);
  }

  function handleNodePointerDown(event: ReactPointerEvent<HTMLButtonElement>, node: ModelNode) {
    if (edgeCreationSourceId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setSelectedFrameId(null);
    setDraggingNodeId(node.id);
    dragStateRef.current = {
      nodeId: node.id,
      pointerOrigin: {
        x: event.clientX,
        y: event.clientY
      },
      startPosition: node.position,
      nextPosition: node.position
    };
  }

  function handleNodeClick(event: ReactMouseEvent<HTMLButtonElement>, node: ModelNode) {
    event.stopPropagation();

    if (edgeCreationSourceId) {
      void handleCreateEdge(node.id);
      return;
    }

    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setSelectedFrameId(null);
  }

  function handleEdgeClick(event: ReactMouseEvent<SVGLineElement>, edgeId: string) {
    event.stopPropagation();
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setSelectedFrameId(null);
    setEdgeCreationSourceId(null);
  }

  function handleFrameClick(event: ReactMouseEvent<HTMLButtonElement>, frameId: string) {
    event.stopPropagation();
    setSelectedFrameId(frameId);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setEdgeCreationSourceId(null);
  }

  function beginEdgeCreation() {
    if (!selectedNode) {
      return;
    }

    setEdgeCreationSourceId((current) => (current === selectedNode.id ? null : selectedNode.id));
    setSelectedEdgeId(null);
    setSelectedFrameId(null);
    setError(null);
  }

  function handleFrameMembershipToggle(nodeId: string, checked: boolean) {
    setFrameNodeIdsDraft((current) => {
      if (checked) {
        return current.includes(nodeId) ? current : [...current, nodeId];
      }

      return current.filter((candidate) => candidate !== nodeId);
    });
  }

  return (
    <div className="screen-shell">
      <section className="browser-panel">
        <div className="eyebrow">M3-03 | Navigation context</div>
        <h1>VisualExperiments</h1>
        <p className="lede">
          Open freeform models, keep project context visible, and move between models through a shared runtime navigation path.
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
            <p>Create the first one to bootstrap a folder with <code>project.yaml</code>, <code>models/</code>, and a persistent freeform workspace.</p>
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
              <div className="workspace-heading">
                <div className="eyebrow">Project open</div>
                <h2>{currentProject.name}</h2>
                <p className="workspace-copy">
                  The workspace now keeps a reusable navigation context for future drill-down and step-up flows without
                  persisting runtime breadcrumbs into YAML.
                </p>
                <div className="workspace-context-card">
                  <span className="selection-label">Current model context</span>
                  <strong>{currentModel ? currentModel.name : "Project root"}</strong>
                  <span className="selection-path">
                    {currentModel ? currentModel.path : "Select a YAML model from the project tree to begin navigation."}
                  </span>
                  {navigationBreadcrumbs.length > 0 ? (
                    <ol className="breadcrumb-list" aria-label="Model breadcrumbs">
                      {navigationBreadcrumbs.map((target, index) => {
                        const isCurrent = currentModel?.path === target.modelPath;

                        return (
                          <li key={`${target.modelPath}-${index}`} className="breadcrumb-item">
                            {index > 0 ? <span className="breadcrumb-divider">/</span> : null}
                            <button
                              type="button"
                              className={`breadcrumb-button ${isCurrent ? "breadcrumb-button-current" : ""}`}
                              onClick={() => void handleNavigateBreadcrumb(target.modelPath)}
                              disabled={isCurrent || loadingModel}
                            >
                              <span className="breadcrumb-name">{target.modelName}</span>
                              <span className="breadcrumb-path">{target.modelPath}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="panel-copy">
                      Breadcrumbs will appear after the first model opens and will stay in runtime state only.
                    </p>
                  )}
                </div>
              </div>
              <div className="toolbar-actions">
                <button type="button" className="ghost-button" onClick={() => navigateTo("/")}>
                  Back to projects
                </button>
                <button type="button" className="ghost-button" onClick={() => void handleNavigateBack()} disabled={!canGoBack || loadingModel}>
                  {loadingModel && canGoBack ? "Opening..." : "Back"}
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
                  Create the next model in the selected folder context, or open an existing YAML model to continue editing.
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
                  <TreeView node={projectTree} selectedPath={selectedTreePath} onSelectNode={handleTreeSelect} />
                ) : (
                  <p className="status">Loading tree...</p>
                )}
              </section>

              <section className="shell-panel shell-panel-center">
                <div className="panel-header panel-header-row">
                  <div>
                    <span className="panel-kicker">Center panel</span>
                    <h3>{currentModel ? "Freeform canvas" : "Canvas waiting for model"}</h3>
                  </div>
                  {currentModel ? (
                    <div className="toolbar-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => void handleCreateNode()}
                        disabled={mutatingNodeId === "creating-node"}
                      >
                        {mutatingNodeId === "creating-node" ? "Adding..." : "Add node"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => void handleCreateFrame()}
                        disabled={mutatingFrameId === "creating-frame"}
                      >
                        {mutatingFrameId === "creating-frame" ? "Adding..." : "Add frame"}
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="placeholder-surface">
                  {!currentModel ? (
                    <>
                      <p>
                        Create the first freeform model to bootstrap the editor. Once opened, double-clicking the canvas
                        creates nodes, selecting a node unlocks edges, and frames can be created as semantic containers.
                      </p>
                      <div className="canvas-surface canvas-surface-empty">
                        <div className="canvas-badge">No model open</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Double-click to place nodes, drag cards to move them, then create outgoing edges or define frames
                        while the workspace keeps the current model path and return targets visible.
                      </p>
                      <div className="selection-card">
                        <span className="selection-label">Opened model</span>
                        <strong>{currentModel.name}</strong>
                        <span className="selection-path">{currentModel.path}</span>
                        <span className="selection-path">
                          Navigation depth: {navigationBreadcrumbs.length} {navigationBreadcrumbs.length === 1 ? "model" : "models"}
                        </span>
                      </div>
                      {edgeCreationSourceId ? (
                        <div className="edge-mode-banner">
                          <span className="selection-label">Edge creation</span>
                          <strong>Source: {lookupNodeLabel(currentModel, edgeCreationSourceId)}</strong>
                          <p>Click another node on the canvas to create a directed edge, or press the button again to cancel.</p>
                        </div>
                      ) : null}
                      {selectedFrame ? (
                        <div className="frame-mode-banner">
                          <span className="selection-label">Frame selected</span>
                          <strong>{selectedFrame.name}</strong>
                          <p>Use the right panel to edit metadata and manage which node ids belong to this frame.</p>
                        </div>
                      ) : null}
                      <div className="canvas-stage" onDoubleClick={handleCanvasDoubleClick} onClick={handleCanvasClick}>
                        <div className="canvas-badge">notation: {currentModel.notation}</div>
                        {currentModel.frames.map((frame, index) => {
                          const bounds = getFrameBounds(frame, currentModel.nodes, index);
                          const isSelected = selectedFrameId === frame.id;

                          return (
                            <button
                              key={frame.id}
                              type="button"
                              className={`canvas-frame-card ${isSelected ? "canvas-frame-card-selected" : ""}`}
                              style={{
                                left: `${bounds.x}px`,
                                top: `${bounds.y}px`,
                                width: `${bounds.width}px`,
                                height: `${bounds.height}px`
                              }}
                              onClick={(event) => handleFrameClick(event, frame.id)}
                            >
                              <span className="canvas-frame-title">{frame.name}</span>
                              <span className="canvas-frame-copy">
                                {frame.description || `${frame.nodeIds.length} node${frame.nodeIds.length === 1 ? "" : "s"} in frame`}
                              </span>
                            </button>
                          );
                        })}
                        <svg className="canvas-edge-layer" aria-hidden="true">
                          <defs>
                            <marker id="edge-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                              <path d="M0,0 L12,6 L0,12 z" fill="#7c8aa5" />
                            </marker>
                            <marker id="edge-arrow-active" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                              <path d="M0,0 L12,6 L0,12 z" fill="#2563eb" />
                            </marker>
                          </defs>
                          {currentModel.edges.map((edge) => {
                            const sourceNode = currentModel.nodes.find((node) => node.id === edge.source);
                            const targetNode = currentModel.nodes.find((node) => node.id === edge.target);

                            if (!sourceNode || !targetNode) {
                              return null;
                            }

                            const sourcePoint = getNodeAnchor(sourceNode);
                            const targetPoint = getNodeAnchor(targetNode);
                            const isSelected = selectedEdgeId === edge.id;

                            return (
                              <g key={edge.id} className="canvas-edge-group">
                                <line
                                  className="canvas-edge-hit"
                                  x1={sourcePoint.x}
                                  y1={sourcePoint.y}
                                  x2={targetPoint.x}
                                  y2={targetPoint.y}
                                  onClick={(event) => handleEdgeClick(event, edge.id)}
                                />
                                <line
                                  className={`canvas-edge-path ${isSelected ? "canvas-edge-path-selected" : ""}`}
                                  x1={sourcePoint.x}
                                  y1={sourcePoint.y}
                                  x2={targetPoint.x}
                                  y2={targetPoint.y}
                                  markerEnd={isSelected ? "url(#edge-arrow-active)" : "url(#edge-arrow)"}
                                />
                              </g>
                            );
                          })}
                        </svg>
                        {currentModel.nodes.length === 0 ? (
                          <div className="canvas-node-placeholder">Double-click anywhere here to create the first node</div>
                        ) : null}
                        {currentModel.nodes.map((node) => (
                          <button
                            key={node.id}
                            type="button"
                            className={`canvas-node-card ${
                              selectedNodeId === node.id ? "canvas-node-card-selected" : ""
                            } ${draggingNodeId === node.id ? "canvas-node-card-dragging" : ""} ${
                              edgeCreationSourceId === node.id ? "canvas-node-card-source" : ""
                            }`}
                            style={{
                              transform: `translate(${node.position.x}px, ${node.position.y}px)`
                            }}
                            onClick={(event) => handleNodeClick(event, node)}
                            onPointerDown={(event) => handleNodePointerDown(event, node)}
                            onDoubleClick={(event) => event.stopPropagation()}
                          >
                            <strong>{node.label}</strong>
                            <span>{node.description || "No description yet"}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="shell-panel">
                <div className="panel-header">
                  <span className="panel-kicker">Right panel</span>
                  <h3>
                    {!currentModel
                      ? "Project properties"
                      : selectedNode
                        ? "Node properties"
                        : selectedEdge
                          ? "Edge properties"
                          : "Model properties"}
                  </h3>
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
                  ) : selectedNode ? (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Node ID</span>
                        <strong>{selectedNode.id}</strong>
                      </div>
                      <form className="node-form" onSubmit={handleSaveNodeDetails}>
                        <label htmlFor="nodeLabel">Label</label>
                        <input
                          id="nodeLabel"
                          name="nodeLabel"
                          value={nodeLabelDraft}
                          onChange={(event) => setNodeLabelDraft(event.target.value)}
                          autoComplete="off"
                        />
                        <label htmlFor="nodeDescription">Description</label>
                        <textarea
                          id="nodeDescription"
                          name="nodeDescription"
                          value={nodeDescriptionDraft}
                          onChange={(event) => setNodeDescriptionDraft(event.target.value)}
                          rows={5}
                        />
                        <p className="form-hint">
                          Position: {selectedNode.position.x}, {selectedNode.position.y}
                        </p>
                        <div className="property-actions">
                          <button type="submit" disabled={mutatingNodeId === selectedNode.id}>
                            {mutatingNodeId === selectedNode.id ? "Saving..." : "Save changes"}
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={beginEdgeCreation}
                            disabled={mutatingEdgeId === "creating-edge"}
                          >
                            {edgeCreationSourceId === selectedNode.id ? "Cancel edge mode" : "Create outgoing edge"}
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => void handleDeleteSelectedNode()}
                            disabled={mutatingNodeId === selectedNode.id}
                          >
                            Delete node
                          </button>
                        </div>
                        <div className="drilldown-card">
                          <span className="selection-label">Drill-down</span>
                          <p className="panel-copy">
                            Create a child model in the same folder as the current model or link an existing model as a drill-down target.
                          </p>
                          {selectedNode.drilldowns.length === 0 ? (
                            <p className="status">No child models linked yet.</p>
                          ) : (
                            <ul className="edge-list">
                              {selectedNode.drilldowns.map((drilldownPath) => {
                                const isAvailable = projectTree ? treeContainsPath(projectTree, drilldownPath) : false;

                                return (
                                  <li key={`${selectedNode.id}-${drilldownPath}`}>
                                    <button
                                      type="button"
                                      className={`edge-list-item ${!isAvailable ? "edge-list-item-warning" : ""}`}
                                      onClick={() => void handleOpenDrilldown(drilldownPath)}
                                      disabled={mutatingDrilldownNodeId === selectedNode.id}
                                    >
                                      {isAvailable ? "Open" : "Missing"}
                                      {" | "}
                                      {drilldownPath}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          {selectedNodeRecoveryTarget ? (
                            <div className="drilldown-recovery-card">
                              <span className="selection-label">Recovery path</span>
                              <strong>Model not found. Create replacement?</strong>
                              <span className="selection-path">{selectedNodeRecoveryTarget}</span>
                              <div className="property-actions">
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={() => void handleCreateDrilldownModel(selectedNodeRecoveryTarget)}
                                  disabled={mutatingDrilldownNodeId === selectedNode.id}
                                >
                                  {mutatingDrilldownNodeId === selectedNode.id ? "Creating..." : "Create replacement"}
                                </button>
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={() => void handleLinkExistingDrilldown(selectedNodeRecoveryTarget)}
                                  disabled={mutatingDrilldownNodeId === selectedNode.id || !existingDrilldownTargetPath}
                                >
                                  Replace with selected model
                                </button>
                              </div>
                            </div>
                          ) : null}
                          <div className="drilldown-link-card">
                            <label htmlFor="existingDrilldownTarget">Existing model</label>
                            <select
                              id="existingDrilldownTarget"
                              value={existingDrilldownTargetPath}
                              onChange={(event) => setExistingDrilldownTargetPath(event.target.value)}
                              disabled={availableDrilldownTargets.length === 0}
                            >
                              {availableDrilldownTargets.length === 0 ? (
                                <option value="">No unlinked models available</option>
                              ) : (
                                availableDrilldownTargets.map((candidate) => (
                                  <option key={candidate} value={candidate}>
                                    {candidate}
                                  </option>
                                ))
                              )}
                            </select>
                            <div className="property-actions">
                              <button
                                type="button"
                                className="ghost-button"
                                onClick={() => void handleCreateDrilldownModel()}
                                disabled={mutatingDrilldownNodeId === selectedNode.id}
                              >
                                {mutatingDrilldownNodeId === selectedNode.id ? "Creating..." : "Create child model"}
                              </button>
                              <button
                                type="button"
                                className="ghost-button"
                                onClick={() => void handleLinkExistingDrilldown()}
                                disabled={
                                  mutatingDrilldownNodeId === selectedNode.id ||
                                  !existingDrilldownTargetPath
                                }
                              >
                                {mutatingDrilldownNodeId === selectedNode.id ? "Linking..." : "Link selected model"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </>
                  ) : selectedFrame ? (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Frame ID</span>
                        <strong>{selectedFrame.id}</strong>
                      </div>
                      <form className="node-form" onSubmit={handleSaveFrameDetails}>
                        <label htmlFor="frameName">Frame name</label>
                        <input
                          id="frameName"
                          name="frameName"
                          value={frameNameDraft}
                          onChange={(event) => setFrameNameDraft(event.target.value)}
                          autoComplete="off"
                        />
                        <label htmlFor="frameDescription">Description</label>
                        <textarea
                          id="frameDescription"
                          name="frameDescription"
                          value={frameDescriptionDraft}
                          onChange={(event) => setFrameDescriptionDraft(event.target.value)}
                          rows={4}
                        />
                        <div className="membership-card">
                          <span className="selection-label">Membership</span>
                          {currentModel.nodes.length === 0 ? (
                            <p className="status">Create nodes first to add them into a frame.</p>
                          ) : (
                            <div className="membership-list">
                              {currentModel.nodes.map((node) => (
                                <label key={node.id} className="membership-item">
                                  <input
                                    type="checkbox"
                                    checked={frameNodeIdsDraft.includes(node.id)}
                                    onChange={(event) => handleFrameMembershipToggle(node.id, event.target.checked)}
                                  />
                                  <span>{node.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="stepup-card">
                          <span className="selection-label">Step-up</span>
                          {selectedFrame.stepUp ? (
                            <>
                              <strong>
                                {selectedFrameRecoveryTarget ? "Upper-level target needs recovery" : "Upper-level target linked"}
                              </strong>
                              <span className="selection-path">{selectedFrame.stepUp.model}</span>
                              <span className="form-hint">Representative node: {selectedFrame.stepUp.nodeId}</span>
                            </>
                          ) : (
                            <>
                              <strong>No upper-level model yet</strong>
                              <span className="form-hint">
                                Step up will create an abstraction model under `models/abstractions/` and persist `frame.stepUp`.
                              </span>
                            </>
                          )}
                          <div className="property-actions">
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => void handleFrameStepUp("default")}
                              disabled={mutatingFrameId === selectedFrame.id}
                            >
                              {mutatingFrameId === selectedFrame.id
                                ? selectedFrame.stepUp
                                  ? "Opening..."
                                  : "Creating..."
                                : "Step up"}
                            </button>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => void handleOpenFrameStepUp()}
                              disabled={mutatingFrameId === selectedFrame.id || !selectedFrame.stepUp}
                            >
                              Open upper level
                            </button>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => void handleFrameStepUp("regenerate")}
                              disabled={mutatingFrameId === selectedFrame.id || !selectedFrame.stepUp}
                            >
                              {mutatingFrameId === selectedFrame.id ? "Regenerating..." : "Regenerate"}
                            </button>
                          </div>
                        </div>
                        {selectedFrameRecoveryTarget ? (
                          <div className="stepup-recovery-card">
                            <span className="selection-label">Recovery path</span>
                            <strong>Upper-level model is missing.</strong>
                            <span className="selection-path">{selectedFrameRecoveryTarget}</span>
                            <span className="form-hint">
                              Use manual regenerate to rebuild the representative node contract without enabling live sync.
                            </span>
                            <div className="property-actions">
                              <button
                                type="button"
                                className="ghost-button"
                                onClick={() => void handleFrameStepUp("regenerate")}
                                disabled={mutatingFrameId === selectedFrame.id || !selectedFrame.stepUp}
                              >
                                {mutatingFrameId === selectedFrame.id ? "Rebuilding..." : "Rebuild target"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="property-actions">
                          <button type="submit" disabled={mutatingFrameId === selectedFrame.id}>
                            {mutatingFrameId === selectedFrame.id ? "Saving..." : "Save frame"}
                          </button>
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => void handleDeleteSelectedFrame()}
                            disabled={mutatingFrameId === selectedFrame.id}
                          >
                            Delete frame
                          </button>
                        </div>
                      </form>
                    </>
                  ) : selectedEdge ? (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Edge ID</span>
                        <strong>{selectedEdge.id}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Direction</span>
                        <strong>
                          {lookupNodeLabel(currentModel, selectedEdge.source)}
                          {" -> "}
                          {lookupNodeLabel(currentModel, selectedEdge.target)}
                        </strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Stable references</span>
                        <strong>
                          {selectedEdge.source}
                          {" -> "}
                          {selectedEdge.target}
                        </strong>
                      </div>
                      <div className="property-actions">
                        <button
                          type="button"
                          onClick={() => void handleDeleteSelectedEdge()}
                          disabled={mutatingEdgeId === selectedEdge.id}
                        >
                          {mutatingEdgeId === selectedEdge.id ? "Deleting..." : "Delete edge"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="property-card">
                        <span className="selection-label">Navigation context</span>
                        <strong>{navigationBreadcrumbs.length} {navigationBreadcrumbs.length === 1 ? "model" : "models"} in path</strong>
                        <span className="selection-path">
                          {canGoBack
                            ? `Back target: ${navigationState.stack[navigationState.stack.length - 1]?.modelPath ?? "n/a"}`
                            : "No back target yet"}
                        </span>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Model ID</span>
                        <strong>{currentModel.id}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Collections</span>
                        <strong>
                          nodes {currentModel.nodes.length} | edges {currentModel.edges.length} | frames {currentModel.frames.length}
                        </strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Model path</span>
                        <strong>{currentModel.path}</strong>
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Edges</span>
                        {currentModel.edges.length === 0 ? (
                          <strong>No edges yet</strong>
                        ) : (
                          <ul className="edge-list">
                            {currentModel.edges.map((edge) => (
                              <li key={edge.id}>
                                <button
                                  type="button"
                                  className={`edge-list-item ${selectedEdgeId === edge.id ? "edge-list-item-selected" : ""}`}
                                  onClick={() => {
                                    setSelectedEdgeId(edge.id);
                                    setSelectedNodeId(null);
                                    setEdgeCreationSourceId(null);
                                  }}
                                >
                                  {lookupNodeLabel(currentModel, edge.source)}
                                  {" -> "}
                                  {lookupNodeLabel(currentModel, edge.target)}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="property-card">
                        <span className="selection-label">Frames</span>
                        {currentModel.frames.length === 0 ? (
                          <strong>No frames yet</strong>
                        ) : (
                          <ul className="edge-list">
                            {currentModel.frames.map((frame) => (
                              <li key={frame.id}>
                                <button
                                  type="button"
                                  className={`edge-list-item ${selectedFrameId === frame.id ? "edge-list-item-selected" : ""}`}
                                  onClick={() => {
                                    setSelectedFrameId(frame.id);
                                    setSelectedNodeId(null);
                                    setSelectedEdgeId(null);
                                    setEdgeCreationSourceId(null);
                                  }}
                                >
                                  {frame.name} ({frame.nodeIds.length})
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="empty-state compact-empty-state">
                        <h3>No selection</h3>
                        <p>Select a node, edge, or frame to inspect it. Frames group node ids semantically without deleting the nodes themselves.</p>
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

function buildModelOpenErrorMessage(targetLabel: string, error: unknown, failureMode?: "keep-current" | "clear-current"): string {
  const baseMessage = getErrorMessage(error);

  if (failureMode === "clear-current") {
    return `Could not open ${targetLabel}. ${baseMessage} Select another model from the project tree to recover.`;
  }

  return `Could not open ${targetLabel}. ${baseMessage} The current workspace context stayed in place so you can recover from the tree or breadcrumbs.`;
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

function collectModelPaths(node: ProjectTreeNode): string[] {
  const paths: string[] = [];

  if (isModelFilePath(node.path)) {
    paths.push(node.path);
  }

  for (const child of node.children ?? []) {
    paths.push(...collectModelPaths(child));
  }

  return paths;
}

function isModelFilePath(path: string): boolean {
  return path !== "project.yaml" && path.endsWith(".yaml");
}

function buildDrilldownModelName(nodeLabel: string): string {
  return `${nodeLabel.trim() || "Node"} Detail`;
}

function mergeDrilldownPaths(existingPaths: string[], nextPath: string, replacePath?: string): string[] {
  const nextPaths = replacePath
    ? existingPaths.map((candidate) => (candidate === replacePath ? nextPath : candidate))
    : [...existingPaths, nextPath];

  return nextPaths.filter((candidate, index) => nextPaths.indexOf(candidate) === index);
}

function describeCreationTarget(path: string): string {
  if (!path || path === "project-root" || path === "project.yaml") {
    return "models/ (or models/main.yaml for the first model)";
  }

  return formatSelectedPath(path);
}

function getDefaultNodePosition(index: number): ModelNodePosition {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    x: 32 + column * 196,
    y: 72 + row * 132
  };
}

function clampPosition(value: number, boundary: number, size: number): number {
  const maxValue = Math.max(16, boundary - size - 16);
  return roundCoordinate(Math.min(Math.max(16, value), maxValue));
}

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

function updateModelNodePosition(
  model: ModelDetails | null,
  nodeId: string,
  position: ModelNodePosition
): ModelDetails | null {
  if (!model) {
    return model;
  }

  return {
    ...model,
    nodes: model.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            position
          }
        : node
    )
  };
}

function lookupNodeLabel(model: ModelDetails, nodeId: string): string {
  return model.nodes.find((node) => node.id === nodeId)?.label ?? nodeId;
}

function getNodeAnchor(node: ModelNode): ModelNodePosition {
  return {
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y + NODE_HEIGHT / 2
  };
}

function getFrameBounds(frame: ModelFrame, nodes: ModelNode[], index: number): FrameBounds {
  const memberNodes = frame.nodeIds
    .map((nodeId) => nodes.find((node) => node.id === nodeId))
    .filter((node): node is ModelNode => Boolean(node));

  if (memberNodes.length === 0) {
    return {
      x: 24 + index * 28,
      y: 56 + index * 28,
      width: 280,
      height: 152
    };
  }

  const minX = Math.min(...memberNodes.map((node) => node.position.x));
  const minY = Math.min(...memberNodes.map((node) => node.position.y));
  const maxX = Math.max(...memberNodes.map((node) => node.position.x + NODE_WIDTH));
  const maxY = Math.max(...memberNodes.map((node) => node.position.y + NODE_HEIGHT));

  return {
    x: minX - 24,
    y: minY - 56,
    width: maxX - minX + 48,
    height: maxY - minY + 80
  };
}
