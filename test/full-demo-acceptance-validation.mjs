import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";
import {
  createNavigationState,
  getNavigationBreadcrumbs,
  navigateBack,
  openNavigationTarget,
  toNavigationTarget
} from "../dist/server/navigation.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-full-demo-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);
  const stepLog = [];

  let project;
  let sourceModel;
  let detailModelA;
  let detailModelB;
  let typedModel;
  let notation;
  let stepUpTargetPath;
  let sourceFrameId;

  try {
    project = await createProject(firstRun.baseUrl, "Full Demo Acceptance Workspace");
    stepLog.push({ step: 1, result: "PASS", note: "Created project workspace." });

    const reopenedProject = await getProject(firstRun.baseUrl, project.id);
    const initialTree = await getProjectTree(firstRun.baseUrl, project.id);
    assert.equal(reopenedProject.id, project.id);
    assert.ok(treeContainsPath(initialTree, "project.yaml"));
    stepLog.push({ step: 2, result: "PASS", note: "Opened project and confirmed real tree shell." });

    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml", null);
    assert.equal(sourceModel.notation, "freeform");
    stepLog.push({ step: 3, result: "PASS", note: "Created and opened the first freeform model." });

    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 96, y: 132 }
    });
    const capabilityNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Fulfillment",
      position: { x: 332, y: 200 }
    });
    const eventNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Order Event",
      position: { x: 552, y: 148 }
    });
    const edge = await createEdge(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, eventNode.id);
    assert.equal(edge.source, actorNode.id);
    assert.equal(edge.target, eventNode.id);
    stepLog.push({ step: 4, result: "PASS", note: "Created freeform nodes and directed edge on canvas." });

    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Commerce Context",
      description: "Acceptance frame",
      nodeIds: [actorNode.id, capabilityNode.id, eventNode.id]
    });
    sourceFrameId = frame.id;
    assert.equal(frame.nodeIds.length, 3);
    stepLog.push({ step: 5, result: "PASS", note: "Created semantic frame and attached node membership." });

    const firstStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    stepUpTargetPath = firstStepUp.link.model;
    assert.equal(firstStepUp.created, true);
    assert.equal(firstStepUp.upperModel.nodes[0]?.label, "Commerce Context");
    stepLog.push({ step: 6, result: "PASS", note: "Generated upper-level step-up model from frame." });

    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(sourceModel.path, sourceModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(firstStepUp.upperModel.path, firstStepUp.upperModel.name),
      "push"
    );
    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [sourceModel.path, stepUpTargetPath]
    );
    assert.equal(navigateBack(navigationState).target?.modelPath, sourceModel.path);
    stepLog.push({ step: 7, result: "PASS", note: "Opened upper-level model and confirmed breadcrumb/back navigation." });

    detailModelA = await createModel(firstRun.baseUrl, project.id, "Capability Detail", sourceModel.path, null);
    detailModelB = await createModel(firstRun.baseUrl, project.id, "Reference Detail", sourceModel.path, null);
    const afterDrilldown = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      drilldowns: [detailModelA.path, detailModelB.path]
    });
    assert.deepEqual(afterDrilldown.nodes[0]?.drilldowns, [detailModelA.path, detailModelB.path]);
    navigationState = openNavigationTarget(
      createNavigationState(),
      toNavigationTarget(sourceModel.path, sourceModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(detailModelA.path, detailModelA.name),
      "push"
    );
    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [sourceModel.path, detailModelA.path]
    );
    stepLog.push({ step: 8, result: "PASS", note: "Created and opened drill-down model from source node." });

    assert.equal(navigateBack(navigationState).target?.modelPath, sourceModel.path);
    const afterDrilldownRemoval = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      drilldowns: [detailModelB.path]
    });
    const reopenedDetailModelA = await getModel(firstRun.baseUrl, project.id, detailModelA.path);
    assert.deepEqual(afterDrilldownRemoval.nodes[0]?.drilldowns, [detailModelB.path]);
    assert.equal(reopenedDetailModelA.path, detailModelA.path);
    stepLog.push({ step: 9, result: "PASS", note: "Returned from drill-down and verified safe multi-link removal without deleting child model." });

    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, capabilityNode.id, {
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    const afterLateTyping = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, eventNode.id, {
      typing: {
        typeId: "event",
        colorToken: "rose"
      }
    });
    assert.deepEqual(
      afterLateTyping.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "capability", "event"]
    );
    stepLog.push({ step: 10, result: "PASS", note: "Assigned late typing to freeform nodes without losing graph structure." });

    notation = (await createNotation(firstRun.baseUrl, project.id, sourceModel.path)).notation;
    const listedNotations = await listNotations(firstRun.baseUrl, project.id);
    assert.equal(listedNotations.length, 1);
    assert.equal(listedNotations[0]?.id, notation.id);
    stepLog.push({ step: 11, result: "PASS", note: "Extracted notation artifact and registered it in project manifest." });

    typedModel = await createModel(firstRun.baseUrl, project.id, "Operations Typed View", sourceModel.path, notation.id);
    assert.equal(typedModel.notation, notation.id);
    stepLog.push({ step: 12, result: "PASS", note: "Created typed model from persisted notation." });

    const typedNode = await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Customer Touchpoint",
      position: { x: 144, y: 152 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    assert.deepEqual(typedNode.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    stepLog.push({ step: 13, result: "PASS", note: "Added typed node to notation-backed model." });

    const saveResult = await saveProject(firstRun.baseUrl, project.id);
    assert.equal(saveResult.modelCount, 5);
    assert.equal(saveResult.notationCount, 1);
    stepLog.push({ step: 14, result: "PASS", note: "Saved project checkpoint before restart." });
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedProject = await getProject(secondRun.baseUrl, project.id);
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedUpper = await getModel(secondRun.baseUrl, project.id, stepUpTargetPath);
    const reopenedDetailA = await getModel(secondRun.baseUrl, project.id, detailModelA.path);
    const reopenedDetailB = await getModel(secondRun.baseUrl, project.id, detailModelB.path);
    const reopenedTyped = await getModel(secondRun.baseUrl, project.id, typedModel.path);
    const reopenedNotations = await listNotations(secondRun.baseUrl, project.id);
    const tree = await getProjectTree(secondRun.baseUrl, project.id);
    const sourceText = await readFile(path.join(projectsRoot, project.folderName, sourceModel.path), "utf8");
    const typedText = await readFile(path.join(projectsRoot, project.folderName, typedModel.path), "utf8");

    assert.equal(reopenedProject.defaultModel, sourceModel.path);
    assert.equal(reopenedSource.edges.length, 1);
    assert.equal(reopenedSource.frames[0]?.id, sourceFrameId);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [detailModelB.path]);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.deepEqual(
      reopenedSource.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "capability", "event"]
    );
    assert.equal(reopenedUpper.path, stepUpTargetPath);
    assert.equal(reopenedDetailA.path, detailModelA.path);
    assert.equal(reopenedDetailB.path, detailModelB.path);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.deepEqual(reopenedTyped.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.equal(reopenedNotations.length, 1);
    assert.ok(treeContainsPath(tree, sourceModel.path));
    assert.ok(treeContainsPath(tree, stepUpTargetPath));
    assert.ok(treeContainsPath(tree, detailModelA.path));
    assert.ok(treeContainsPath(tree, detailModelB.path));
    assert.ok(treeContainsPath(tree, typedModel.path));
    assert.ok(treeContainsPath(tree, notation.path));
    assert.match(sourceText, /stepUp:/);
    assert.match(sourceText, /drilldowns:/);
    assert.match(typedText, new RegExp(`^notation: ${notation.id}$`, "m"));

    console.log("PASS M5-04 full demo acceptance covered all 14 steps with no critical/high blockers");
    for (const entry of stepLog) {
      console.log(`STEP ${entry.step} ${entry.result} ${entry.note}`);
    }
  } finally {
    await stopServer(secondRun.server);
  }
}

await main();

async function startServer(projectsRoot, clientRoot) {
  const app = createApp({ projectRoot: projectsRoot, clientRoot });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not determine server address.");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

async function stopServer(server) {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(undefined);
    });
  });
}

async function createProject(baseUrl, name) {
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  return payload.project;
}

async function getProject(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.project;
}

async function createModel(baseUrl, projectId, name, selectedPath, notationId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, selectedPath, notationId })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  return payload.model;
}

async function createNode(baseUrl, projectId, modelPath, payload) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...payload })
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  return result.node;
}

async function updateNode(baseUrl, projectId, modelPath, nodeId, patch) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes/${encodeURIComponent(nodeId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...patch })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.model;
}

async function createEdge(baseUrl, projectId, modelPath, source, target) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/edges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, source, target })
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  return result.edge;
}

async function createFrame(baseUrl, projectId, modelPath, payload) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...payload })
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  return result.frame;
}

async function stepUpFrame(baseUrl, projectId, modelPath, frameId, mode) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames/${encodeURIComponent(frameId)}/step-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, mode })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload;
}

async function createNotation(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/notations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  return payload;
}

async function listNotations(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/notations`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.notations;
}

async function saveProject(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/save`, {
    method: "POST"
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.result;
}

async function getModel(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.model;
}

async function getProjectTree(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/tree`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.tree;
}

function treeContainsPath(node, targetPath) {
  const currentPath = node.path || "";

  if (currentPath === targetPath) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, targetPath)) ?? false;
}
