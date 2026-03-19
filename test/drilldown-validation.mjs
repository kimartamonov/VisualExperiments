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
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-drilldown-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let parentModel;
  let createdChildModel;
  let linkedExistingModel;

  try {
    project = await createProject(firstRun.baseUrl, "Drilldown Workspace");
    parentModel = await createModel(firstRun.baseUrl, project.id, "Main Map", "project.yaml");
    linkedExistingModel = await createModel(firstRun.baseUrl, project.id, "Reference Map", parentModel.path);

    const createdNode = await createNode(firstRun.baseUrl, project.id, parentModel.path, {
      label: "Capability",
      position: { x: 120, y: 160 }
    });

    createdChildModel = await createModel(firstRun.baseUrl, project.id, "Capability Detail", parentModel.path);
    const linkedToCreatedChild = await updateNode(firstRun.baseUrl, project.id, parentModel.path, createdNode.node.id, {
      drilldowns: [createdChildModel.path]
    });

    assert.deepEqual(linkedToCreatedChild.model.nodes[0]?.drilldowns, [createdChildModel.path]);

    const openedChild = await getModel(firstRun.baseUrl, project.id, createdChildModel.path);
    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(parentModel.path, parentModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(openedChild.path, openedChild.name),
      "push"
    );

    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [parentModel.path, createdChildModel.path]
    );

    const backTarget = navigateBack(navigationState).target;
    assert.equal(backTarget?.modelPath, parentModel.path);

    const linkedToExisting = await updateNode(firstRun.baseUrl, project.id, parentModel.path, createdNode.node.id, {
      drilldowns: [createdChildModel.path, linkedExistingModel.path]
    });
    const openedExisting = await getModel(firstRun.baseUrl, project.id, linkedExistingModel.path);

    assert.deepEqual(linkedToExisting.model.nodes[0]?.drilldowns, [createdChildModel.path, linkedExistingModel.path]);
    assert.equal(openedExisting.path, linkedExistingModel.path);

    const linkedToMissing = await updateNode(firstRun.baseUrl, project.id, parentModel.path, createdNode.node.id, {
      drilldowns: [createdChildModel.path, "models/missing-capability.yaml"]
    });
    assert.deepEqual(linkedToMissing.model.nodes[0]?.drilldowns, [createdChildModel.path, "models/missing-capability.yaml"]);

    const missingResponse = await fetch(
      `${firstRun.baseUrl}/api/projects/${project.id}/models?path=${encodeURIComponent("models/missing-capability.yaml")}`
    );
    const missingPayload = await missingResponse.json();

    assert.equal(missingResponse.status, 404);
    assert.match(missingPayload.error, /not found/i);

    const tree = await fetchJson(`${firstRun.baseUrl}/api/projects/${project.id}/tree`);
    assert.ok(treeContainsPath(tree.tree, parentModel.path));
    assert.ok(treeContainsPath(tree.tree, createdChildModel.path));
    assert.ok(treeContainsPath(tree.tree, linkedExistingModel.path));
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedParent = await getModel(secondRun.baseUrl, project.id, parentModel.path);
    const reopenedChild = await getModel(secondRun.baseUrl, project.id, createdChildModel.path);
    const parentText = await readFile(path.join(projectsRoot, project.folderName, parentModel.path), "utf8");

    assert.equal(reopenedChild.path, createdChildModel.path);
    assert.deepEqual(reopenedParent.nodes[0]?.drilldowns, [createdChildModel.path, "models/missing-capability.yaml"]);
    assert.match(parentText, /^\s+drilldowns:$/m);
    assert.match(parentText, /^\s+- models\/missing-capability\.yaml$/m);

    console.log(
      "PASS M3-04 drill-down validation covers create/link/open/return flow, persistence, and broken-link recovery"
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
  const responsePayload = await response.json();

  assert.equal(response.status, 201);
  return responsePayload;
}

async function updateNode(baseUrl, projectId, modelPath, nodeId, patch) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes/${nodeId}`, {
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
