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
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-hierarchy-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let stepUpTargetPath;
  let drilldownAPath;
  let drilldownBPath;
  let frameId;

  try {
    project = await createProject(firstRun.baseUrl, "Hierarchy Validation Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml");

    const parentNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Capability",
      position: { x: 120, y: 160 }
    });
    const siblingNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Operations",
      position: { x: 340, y: 220 }
    });
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Revenue Operations",
      description: "Upper-level validation candidate",
      nodeIds: [parentNode.id, siblingNode.id]
    });
    frameId = frame.id;

    const firstStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    stepUpTargetPath = firstStepUp.link.model;

    assert.equal(firstStepUp.created, true);
    assert.equal(firstStepUp.regenerated, false);
    assert.equal(firstStepUp.upperModel.nodes[0]?.id, firstStepUp.link.nodeId);
    assert.equal(firstStepUp.upperModel.nodes[0]?.label, "Revenue Operations");

    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(firstStepUp.sourceModel.path, firstStepUp.sourceModel.name),
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

    const repeatedStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    assert.equal(repeatedStepUp.created, false);
    assert.equal(repeatedStepUp.regenerated, false);
    assert.deepEqual(repeatedStepUp.link, firstStepUp.link);

    const drilldownA = await createModel(firstRun.baseUrl, project.id, "Capability Detail", sourceModel.path);
    const drilldownB = await createModel(firstRun.baseUrl, project.id, "Capability Alternative", sourceModel.path);
    drilldownAPath = drilldownA.path;
    drilldownBPath = drilldownB.path;

    const linkedBoth = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, parentNode.id, {
      drilldowns: [drilldownA.path, drilldownB.path]
    });
    assert.deepEqual(linkedBoth.model.nodes[0]?.drilldowns, [drilldownA.path, drilldownB.path]);

    const openedDrilldownA = await getModel(firstRun.baseUrl, project.id, drilldownA.path);
    const openedDrilldownB = await getModel(firstRun.baseUrl, project.id, drilldownB.path);
    navigationState = openNavigationTarget(createNavigationState(), toNavigationTarget(sourceModel.path, sourceModel.name), "reset");
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(openedDrilldownA.path, openedDrilldownA.name),
      "push"
    );
    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [sourceModel.path, drilldownA.path]
    );
    assert.equal(navigateBack(navigationState).target?.modelPath, sourceModel.path);

    navigationState = openNavigationTarget(createNavigationState(), toNavigationTarget(sourceModel.path, sourceModel.name), "reset");
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(openedDrilldownB.path, openedDrilldownB.name),
      "push"
    );
    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [sourceModel.path, drilldownB.path]
    );
    assert.equal(navigateBack(navigationState).target?.modelPath, sourceModel.path);

    const withBrokenLink = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, parentNode.id, {
      drilldowns: [drilldownA.path, "models/missing-capability.yaml", drilldownB.path]
    });
    assert.deepEqual(withBrokenLink.model.nodes[0]?.drilldowns, [drilldownA.path, "models/missing-capability.yaml", drilldownB.path]);

    const missingResponse = await fetch(
      `${firstRun.baseUrl}/api/projects/${project.id}/models?path=${encodeURIComponent("models/missing-capability.yaml")}`
    );
    const missingPayload = await missingResponse.json();
    assert.equal(missingResponse.status, 404);
    assert.match(missingPayload.error ?? "", /not found/i);

    const afterBrokenRemoval = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, parentNode.id, {
      drilldowns: [drilldownA.path, drilldownB.path]
    });
    assert.deepEqual(afterBrokenRemoval.model.nodes[0]?.drilldowns, [drilldownA.path, drilldownB.path]);

    const tree = await fetchJson(`${firstRun.baseUrl}/api/projects/${project.id}/tree`);
    assert.ok(treeContainsPath(tree.tree, sourceModel.path));
    assert.ok(treeContainsPath(tree.tree, stepUpTargetPath));
    assert.ok(treeContainsPath(tree.tree, drilldownA.path));
    assert.ok(treeContainsPath(tree.tree, drilldownB.path));
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedStepUp = await getModel(secondRun.baseUrl, project.id, stepUpTargetPath);
    const reopenedDrilldownA = await getModel(secondRun.baseUrl, project.id, drilldownAPath);
    const reopenedDrilldownB = await getModel(secondRun.baseUrl, project.id, drilldownBPath);
    const sourceText = await readFile(path.join(projectsRoot, project.folderName, sourceModel.path), "utf8");

    assert.equal(reopenedSource.frames[0]?.id, frameId);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [drilldownAPath, drilldownBPath]);
    assert.equal(reopenedStepUp.path, stepUpTargetPath);
    assert.equal(reopenedDrilldownA.path, drilldownAPath);
    assert.equal(reopenedDrilldownB.path, drilldownBPath);
    assert.match(sourceText, /stepUp:/);
    assert.match(sourceText, /^\s+drilldowns:$/m);

    console.log(
      "PASS M3-07 hierarchy validation covers AC-7 and AC-8, demo steps 6-9, broken-link recovery, and found no blocker-level defects"
    );
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

async function createModel(baseUrl, projectId, name, selectedPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, selectedPath })
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
  return payload;
}

async function getModel(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.model;
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

async function fetchJson(url) {
  const response = await fetch(url);

  assert.equal(response.ok, true);
  return response.json();
}

function treeContainsPath(node, targetPath) {
  const currentPath = node.path || "";

  if (currentPath === targetPath) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, targetPath)) ?? false;
}
