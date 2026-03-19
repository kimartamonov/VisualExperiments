import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-freeform-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");

  const firstRun = await startServer(projectsRoot, clientRoot);

  let createdProject;
  let primaryModel;
  let secondaryModel;

  try {
    const landingPage = await fetchText(`${firstRun.baseUrl}/`);
    assert.match(landingPage, /<div id="root"><\/div>/i);

    const workspaceRoute = await fetchText(`${firstRun.baseUrl}/projects/example`);
    assert.match(workspaceRoute, /assets\/app\.js/i);

    createdProject = await createProject(firstRun.baseUrl, "Model Workspace");

    const listedProjects = await fetchJson(`${firstRun.baseUrl}/api/projects`);
    assert.equal(listedProjects.projects.length, 1);
    assert.equal(listedProjects.projects[0].id, createdProject.id);

    primaryModel = await createModel(firstRun.baseUrl, createdProject.id, "Main Map", "project.yaml");
    const firstNode = await createNode(firstRun.baseUrl, createdProject.id, primaryModel.path, { x: 72, y: 104 });
    const secondNode = await createNode(firstRun.baseUrl, createdProject.id, primaryModel.path, { x: 284, y: 180 });
    const firstEdge = await createEdge(
      firstRun.baseUrl,
      createdProject.id,
      primaryModel.path,
      firstNode.node.id,
      secondNode.node.id
    );
    const secondEdge = await createEdge(
      firstRun.baseUrl,
      createdProject.id,
      primaryModel.path,
      secondNode.node.id,
      firstNode.node.id
    );
    const createdFrame = await createFrame(firstRun.baseUrl, createdProject.id, primaryModel.path);
    const renamedModel = await updateNode(firstRun.baseUrl, createdProject.id, primaryModel.path, firstNode.node.id, {
      label: "Customer journey",
      description: "Primary interaction point",
      position: { x: 156, y: 208 }
    });
    const framedModel = await updateFrame(firstRun.baseUrl, createdProject.id, primaryModel.path, createdFrame.frame.id, {
      name: "Customer area",
      description: "Step-up candidate",
      nodeIds: [firstNode.node.id, secondNode.node.id]
    });
    const edgeDeletedModel = await deleteEdge(firstRun.baseUrl, createdProject.id, primaryModel.path, secondEdge.edge.id);
    const cleanedModel = await deleteNode(firstRun.baseUrl, createdProject.id, primaryModel.path, secondNode.node.id);

    secondaryModel = await createModel(firstRun.baseUrl, createdProject.id, "Support Map", "maps/support.yaml");
    const supportFirstNode = await createNode(firstRun.baseUrl, createdProject.id, secondaryModel.path, { x: 96, y: 140 });
    const supportSecondNode = await createNode(firstRun.baseUrl, createdProject.id, secondaryModel.path, { x: 348, y: 236 });
    const supportEdge = await createEdge(
      firstRun.baseUrl,
      createdProject.id,
      secondaryModel.path,
      supportFirstNode.node.id,
      supportSecondNode.node.id
    );
    const supportFrame = await createFrame(firstRun.baseUrl, createdProject.id, secondaryModel.path);
    const supportUpdatedModel = await updateFrame(
      firstRun.baseUrl,
      createdProject.id,
      secondaryModel.path,
      supportFrame.frame.id,
      {
        name: "Support lane",
        description: "Second validation pass",
        nodeIds: [supportFirstNode.node.id, supportSecondNode.node.id]
      }
    );

    assert.equal(primaryModel.path, "models/main.yaml");
    assert.equal(primaryModel.notation, "freeform");
    assert.deepEqual(primaryModel.nodes, []);
    assert.deepEqual(primaryModel.edges, []);
    assert.deepEqual(primaryModel.frames, []);
    assert.equal(firstNode.node.label, "Node 1");
    assert.equal(secondNode.node.label, "Node 2");
    assert.equal(firstEdge.edge.source, firstNode.node.id);
    assert.equal(firstEdge.edge.target, secondNode.node.id);
    assert.equal(secondEdge.model.edges.length, 2);
    assert.equal(createdFrame.frame.name, "Frame 1");
    assert.equal(renamedModel.model.nodes[0].label, "Customer journey");
    assert.equal(renamedModel.model.nodes[0].description, "Primary interaction point");
    assert.deepEqual(renamedModel.model.nodes[0].position, { x: 156, y: 208 });
    assert.equal(framedModel.model.frames[0].name, "Customer area");
    assert.equal(framedModel.model.frames[0].description, "Step-up candidate");
    assert.deepEqual(framedModel.model.frames[0].nodeIds, [firstNode.node.id, secondNode.node.id]);
    assert.equal(framedModel.model.frames[0].stepUp, null);
    assert.equal(edgeDeletedModel.model.edges.length, 1);
    assert.equal(cleanedModel.model.nodes.length, 1);
    assert.equal(cleanedModel.model.edges.length, 0);
    assert.deepEqual(cleanedModel.model.frames[0].nodeIds, [firstNode.node.id]);
    assert.equal(secondaryModel.path, "models/support-map.yaml");
    assert.equal(secondaryModel.notation, "freeform");
    assert.equal(supportEdge.edge.source, supportFirstNode.node.id);
    assert.equal(supportEdge.edge.target, supportSecondNode.node.id);
    assert.equal(supportUpdatedModel.model.nodes.length, 2);
    assert.equal(supportUpdatedModel.model.edges.length, 1);
    assert.equal(supportUpdatedModel.model.frames.length, 1);
    assert.equal(supportUpdatedModel.model.frames[0].name, "Support lane");
    assert.equal(supportUpdatedModel.model.frames[0].description, "Second validation pass");
    assert.deepEqual(supportUpdatedModel.model.frames[0].nodeIds, [supportFirstNode.node.id, supportSecondNode.node.id]);
    assert.equal(supportUpdatedModel.model.frames[0].stepUp, null);

    const manifestText = await readFile(path.join(projectsRoot, createdProject.folderName, "project.yaml"), "utf8");
    const primaryModelText = await readFile(path.join(projectsRoot, createdProject.folderName, primaryModel.path), "utf8");
    const secondaryModelText = await readFile(path.join(projectsRoot, createdProject.folderName, secondaryModel.path), "utf8");

    assert.match(manifestText, /^defaultModel: models\/main\.yaml$/m);
    assert.match(primaryModelText, /^notation: freeform$/m);
    assert.match(primaryModelText, /^\s+label: Customer journey$/m);
    assert.match(primaryModelText, /^\s+description: Primary interaction point$/m);
    assert.match(primaryModelText, /^\s+x: 156$/m);
    assert.match(primaryModelText, /^\s+'?y'?: 208$/m);
    assert.match(primaryModelText, /^edges: \[\]$/m);
    assert.match(primaryModelText, /^\s+name: Customer area$/m);
    assert.match(primaryModelText, /^\s+description: Step-up candidate$/m);
    assert.match(primaryModelText, /^\s+stepUp: null$/m);
    assert.match(secondaryModelText, /^notation: freeform$/m);
    assert.match(secondaryModelText, /^\s+name: Support lane$/m);
    assert.match(secondaryModelText, /^\s+description: Second validation pass$/m);
    assert.match(secondaryModelText, /^\s+stepUp: null$/m);

    const tree = await fetchJson(`${firstRun.baseUrl}/api/projects/${createdProject.id}/tree`);
    assert.ok(treeContainsPath(tree.tree, "project.yaml"));
    assert.ok(treeContainsPath(tree.tree, "models/main.yaml"));
    assert.ok(treeContainsPath(tree.tree, "models/support-map.yaml"));

    const reopenedModel = await fetchJson(
      `${firstRun.baseUrl}/api/projects/${createdProject.id}/models?path=${encodeURIComponent(primaryModel.path)}`
    );
    assert.equal(reopenedModel.model.path, "models/main.yaml");
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedProject = await fetchJson(`${secondRun.baseUrl}/api/projects/${createdProject.id}`);
    assert.equal(reopenedProject.project.defaultModel, "models/main.yaml");

    const reopenedPrimaryModel = await fetchJson(
      `${secondRun.baseUrl}/api/projects/${createdProject.id}/models?path=${encodeURIComponent(primaryModel.path)}`
    );
    assert.equal(reopenedPrimaryModel.model.name, "Main Map");
    assert.equal(reopenedPrimaryModel.model.notation, "freeform");
    assert.equal(reopenedPrimaryModel.model.nodes.length, 1);
    assert.equal(reopenedPrimaryModel.model.nodes[0].label, "Customer journey");
    assert.equal(reopenedPrimaryModel.model.nodes[0].description, "Primary interaction point");
    assert.deepEqual(reopenedPrimaryModel.model.nodes[0].position, { x: 156, y: 208 });
    assert.deepEqual(reopenedPrimaryModel.model.edges, []);
    assert.equal(reopenedPrimaryModel.model.frames.length, 1);
    assert.equal(reopenedPrimaryModel.model.frames[0].name, "Customer area");
    assert.equal(reopenedPrimaryModel.model.frames[0].description, "Step-up candidate");
    assert.deepEqual(reopenedPrimaryModel.model.frames[0].nodeIds, [reopenedPrimaryModel.model.nodes[0].id]);
    assert.equal(reopenedPrimaryModel.model.frames[0].stepUp, null);

    const reopenedSecondaryModel = await fetchJson(
      `${secondRun.baseUrl}/api/projects/${createdProject.id}/models?path=${encodeURIComponent(secondaryModel.path)}`
    );
    assert.equal(reopenedSecondaryModel.model.name, "Support Map");
    assert.equal(reopenedSecondaryModel.model.notation, "freeform");
    assert.equal(reopenedSecondaryModel.model.nodes.length, 2);
    assert.equal(reopenedSecondaryModel.model.edges.length, 1);
    assert.equal(reopenedSecondaryModel.model.frames.length, 1);
    assert.equal(reopenedSecondaryModel.model.frames[0].name, "Support lane");
    assert.equal(reopenedSecondaryModel.model.frames[0].description, "Second validation pass");
    assert.deepEqual(
      reopenedSecondaryModel.model.frames[0].nodeIds,
      reopenedSecondaryModel.model.nodes.map((node) => node.id)
    );
    assert.equal(reopenedSecondaryModel.model.frames[0].stepUp, null);

    const deletedFrame = await deleteFrame(
      secondRun.baseUrl,
      createdProject.id,
      primaryModel.path,
      reopenedPrimaryModel.model.frames[0].id
    );
    assert.equal(deletedFrame.model.frames.length, 0);
    assert.equal(deletedFrame.model.nodes.length, 1);

    const secondTree = await fetchJson(`${secondRun.baseUrl}/api/projects/${createdProject.id}/tree`);
    assert.ok(treeContainsPath(secondTree.tree, "models/main.yaml"));
    assert.ok(treeContainsPath(secondTree.tree, "models/support-map.yaml"));

    const routeHtml = await fetchText(`${secondRun.baseUrl}/projects/${createdProject.id}`);
    assert.match(routeHtml, /assets\/app\.js/i);
  } finally {
    await stopServer(secondRun.server);
  }

  console.log("PASS freeform milestone validation covers AC-3..AC-6, demo steps 3-5, reopen, and regression smoke");
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

async function createNode(baseUrl, projectId, modelPath, position) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, position })
  });

  const payload = await response.json();
  assert.equal(response.status, 201);
  return payload;
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

async function deleteNode(baseUrl, projectId, modelPath, nodeId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes/${nodeId}?path=${encodeURIComponent(modelPath)}`, {
    method: "DELETE"
  });

  const payload = await response.json();
  assert.equal(response.status, 200);
  return payload;
}

async function createEdge(baseUrl, projectId, modelPath, source, target) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/edges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, source, target })
  });

  const payload = await response.json();
  assert.equal(response.status, 201);
  return payload;
}

async function deleteEdge(baseUrl, projectId, modelPath, edgeId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/edges/${edgeId}?path=${encodeURIComponent(modelPath)}`, {
    method: "DELETE"
  });

  const payload = await response.json();
  assert.equal(response.status, 200);
  return payload;
}

async function createFrame(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames`, {
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

async function updateFrame(baseUrl, projectId, modelPath, frameId, patch) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames/${frameId}`, {
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

async function deleteFrame(baseUrl, projectId, modelPath, frameId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames/${frameId}?path=${encodeURIComponent(modelPath)}`, {
    method: "DELETE"
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

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.ok, true);
  return response.text();
}

function treeContainsPath(node, targetPath) {
  const currentPath = node.path || "";

  if (currentPath === targetPath) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, targetPath)) ?? false;
}
