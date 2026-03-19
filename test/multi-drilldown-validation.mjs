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
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-multi-drilldown-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let parentModel;
  let childOne;
  let childTwo;
  let nodeId;

  try {
    project = await createProject(firstRun.baseUrl, "Multi Drilldown Workspace");
    parentModel = await createModel(firstRun.baseUrl, project.id, "Main Map", "project.yaml");
    childOne = await createModel(firstRun.baseUrl, project.id, "Capability Detail", parentModel.path);
    childTwo = await createModel(firstRun.baseUrl, project.id, "Reference Detail", parentModel.path);

    const createdNode = await createNode(firstRun.baseUrl, project.id, parentModel.path, {
      label: "Capability",
      position: { x: 120, y: 160 }
    });
    nodeId = createdNode.node.id;

    const linkedBoth = await updateNode(firstRun.baseUrl, project.id, parentModel.path, nodeId, {
      drilldowns: [childOne.path, childTwo.path]
    });

    assert.deepEqual(linkedBoth.model.nodes[0]?.drilldowns, [childOne.path, childTwo.path]);

    const openedChildOne = await getModel(firstRun.baseUrl, project.id, childOne.path);
    const openedChildTwo = await getModel(firstRun.baseUrl, project.id, childTwo.path);
    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(parentModel.path, parentModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(openedChildOne.path, openedChildOne.name),
      "push"
    );

    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [parentModel.path, childOne.path]
    );
    assert.equal(navigateBack(navigationState).target?.modelPath, parentModel.path);

    navigationState = openNavigationTarget(
      createNavigationState(),
      toNavigationTarget(parentModel.path, parentModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(openedChildTwo.path, openedChildTwo.name),
      "push"
    );

    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [parentModel.path, childTwo.path]
    );
    assert.equal(navigateBack(navigationState).target?.modelPath, parentModel.path);

    const afterRemoval = await updateNode(firstRun.baseUrl, project.id, parentModel.path, nodeId, {
      drilldowns: [childTwo.path]
    });
    const removedLinkTarget = await getModel(firstRun.baseUrl, project.id, childOne.path);
    const keptLinkTarget = await getModel(firstRun.baseUrl, project.id, childTwo.path);
    const tree = await fetchJson(`${firstRun.baseUrl}/api/projects/${project.id}/tree`);

    assert.deepEqual(afterRemoval.model.nodes[0]?.drilldowns, [childTwo.path]);
    assert.equal(removedLinkTarget.path, childOne.path);
    assert.equal(keptLinkTarget.path, childTwo.path);
    assert.ok(treeContainsPath(tree.tree, childOne.path));
    assert.ok(treeContainsPath(tree.tree, childTwo.path));
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedParent = await getModel(secondRun.baseUrl, project.id, parentModel.path);
    const reopenedChildTwo = await getModel(secondRun.baseUrl, project.id, childTwo.path);
    const reopenedChildOne = await getModel(secondRun.baseUrl, project.id, childOne.path);
    const parentText = await readFile(path.join(projectsRoot, project.folderName, parentModel.path), "utf8");

    assert.deepEqual(reopenedParent.nodes[0]?.drilldowns, [childTwo.path]);
    assert.equal(reopenedChildOne.path, childOne.path);
    assert.equal(reopenedChildTwo.path, childTwo.path);
    assert.match(parentText, /^\s+drilldowns:$/m);
    assert.match(parentText, /^\s+- models\/reference-detail\.yaml$/m);
    assert.doesNotMatch(parentText, /^\s+- models\/capability-detail\.yaml$/m);

    console.log(
      "PASS M3-06 validation covers multiple drill-down add or open or remove flow, persistence, and safe model retention"
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
  return result;
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
