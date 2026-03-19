import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-typed-model-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let typedModel;
  let secondTypedModel;
  let notation;

  try {
    project = await createProject(firstRun.baseUrl, "Typed Model Validation Workspace");
    const emptyNotations = await listNotations(firstRun.baseUrl, project.id);
    assert.deepEqual(emptyNotations, []);

    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml", null);
    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 96, y: 132 }
    });
    const capabilityNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Fulfillment",
      position: { x: 312, y: 188 }
    });

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

    notation = (await createNotation(firstRun.baseUrl, project.id, sourceModel.path)).notation;
    const listedNotations = await listNotations(firstRun.baseUrl, project.id);

    assert.equal(listedNotations.length, 1);
    assert.equal(listedNotations[0]?.id, notation.id);

    typedModel = await createModel(firstRun.baseUrl, project.id, "Delivery Map", sourceModel.path, notation.id);
    assert.equal(typedModel.notation, notation.id);

    const firstTypedNode = await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Shipment",
      position: { x: 108, y: 144 },
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    const secondTypedNode = await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Customer touchpoint",
      position: { x: 336, y: 220 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    assert.deepEqual(firstTypedNode.typing, {
      typeId: "capability",
      colorToken: "teal"
    });
    assert.deepEqual(secondTypedNode.typing, {
      typeId: "actor",
      colorToken: "amber"
    });

    secondTypedModel = await createModel(firstRun.baseUrl, project.id, "Support Map", typedModel.path, notation.id);
    assert.equal(secondTypedModel.notation, notation.id);

    const tree = await getProjectTree(firstRun.baseUrl, project.id);
    assert.ok(treeContainsPath(tree, typedModel.path));
    assert.ok(treeContainsPath(tree, secondTypedModel.path));

    const typedModelText = await readFile(path.join(projectsRoot, project.folderName, typedModel.path), "utf8");
    assert.match(typedModelText, new RegExp(`^notation: ${notation.id}$`, "m"));
    assert.match(typedModelText, /typeId: capability/);
    assert.match(typedModelText, /typeId: actor/);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedTypedModel = await getModel(secondRun.baseUrl, project.id, typedModel.path);
    const reopenedSecondTypedModel = await getModel(secondRun.baseUrl, project.id, secondTypedModel.path);
    const reopenedNotations = await listNotations(secondRun.baseUrl, project.id);

    assert.equal(reopenedTypedModel.notation, notation.id);
    assert.equal(reopenedTypedModel.nodes.length, 2);
    assert.deepEqual(
      reopenedTypedModel.nodes.map((node) => node.typing?.typeId ?? null),
      ["capability", "actor"]
    );
    assert.equal(reopenedSecondTypedModel.notation, notation.id);
    assert.equal(reopenedSecondTypedModel.nodes.length, 0);
    assert.equal(reopenedNotations.length, 1);

    console.log(
      "PASS M4-03 typed model validation covers AC-11, demo steps 12-13, empty/non-empty notation list smoke, and typed-node reopen persistence"
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

async function listNotations(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/notations`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.notations;
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
