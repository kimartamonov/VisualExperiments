import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-manual-save-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let childModel;
  let typedModel;
  let notation;
  let stepUpTargetPath;

  try {
    project = await createProject(firstRun.baseUrl, "Manual Save Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml", null);
    childModel = await createModel(firstRun.baseUrl, project.id, "Capability Detail", sourceModel.path, null);

    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 92, y: 132 }
    });
    const capabilityNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Fulfillment",
      position: { x: 320, y: 188 }
    });

    await createEdge(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, capabilityNode.id);
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Commerce Context",
      description: "Round-trip source",
      nodeIds: [actorNode.id, capabilityNode.id]
    });

    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      drilldowns: [childModel.path],
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

    const stepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    stepUpTargetPath = stepUp.link.model;
    notation = (await createNotation(firstRun.baseUrl, project.id, sourceModel.path)).notation;
    typedModel = await createModel(firstRun.baseUrl, project.id, "Operations Typed", sourceModel.path, notation.id);

    await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Agent",
      position: { x: 120, y: 152 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    const projectRoot = path.join(projectsRoot, project.folderName);
    const manifestPath = path.join(projectRoot, "project.yaml");
    const sourceModelPath = path.join(projectRoot, sourceModel.path);
    const notationPath = path.join(projectRoot, notation.path);
    const typedModelPath = path.join(projectRoot, typedModel.path);

    await writeFile(
      manifestPath,
      `${await readFile(manifestPath, "utf8")}runtimeBreadcrumbs:\n  - ${sourceModel.path}\n`,
      "utf8"
    );
    await writeFile(
      sourceModelPath,
      `${await readFile(sourceModelPath, "utf8")}selectedNodeId: ${actorNode.id}\nruntimeStack:\n  - ${childModel.path}\n`,
      "utf8"
    );
    await writeFile(
      notationPath,
      `${await readFile(notationPath, "utf8")}uiDraft: true\n`,
      "utf8"
    );
    await writeFile(
      typedModelPath,
      `${await readFile(typedModelPath, "utf8")}selectionState: typed-node\n`,
      "utf8"
    );

    const firstSave = await saveProject(firstRun.baseUrl, project.id);

    assert.equal(firstSave.modelCount, 4);
    assert.equal(firstSave.notationCount, 1);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedProject = await getProject(secondRun.baseUrl, project.id);
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedChild = await getModel(secondRun.baseUrl, project.id, childModel.path);
    const reopenedUpper = await getModel(secondRun.baseUrl, project.id, stepUpTargetPath);
    const reopenedTyped = await getModel(secondRun.baseUrl, project.id, typedModel.path);
    const reopenedNotations = await listNotations(secondRun.baseUrl, project.id);
    const tree = await getProjectTree(secondRun.baseUrl, project.id);
    const secondSave = await saveProject(secondRun.baseUrl, project.id);
    const projectRoot = path.join(projectsRoot, project.folderName);
    const manifestText = await readFile(path.join(projectRoot, "project.yaml"), "utf8");
    const sourceText = await readFile(path.join(projectRoot, sourceModel.path), "utf8");
    const notationText = await readFile(path.join(projectRoot, notation.path), "utf8");
    const typedText = await readFile(path.join(projectRoot, typedModel.path), "utf8");

    assert.equal(reopenedProject.defaultModel, sourceModel.path);
    assert.equal(reopenedSource.nodes.length, 2);
    assert.equal(reopenedSource.edges.length, 1);
    assert.equal(reopenedSource.frames.length, 1);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [childModel.path]);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.equal(reopenedSource.notation, notation.id);
    assert.equal(reopenedChild.path, childModel.path);
    assert.equal(reopenedUpper.path, stepUpTargetPath);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.deepEqual(reopenedTyped.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.equal(reopenedNotations.length, 1);
    assert.ok(treeContainsPath(tree, sourceModel.path));
    assert.ok(treeContainsPath(tree, childModel.path));
    assert.ok(treeContainsPath(tree, stepUpTargetPath));
    assert.ok(treeContainsPath(tree, typedModel.path));
    assert.ok(treeContainsPath(tree, notation.path));
    assert.equal(secondSave.modelCount, 4);
    assert.equal(secondSave.notationCount, 1);
    assert.doesNotMatch(manifestText, /runtimeBreadcrumbs:/);
    assert.doesNotMatch(sourceText, /selectedNodeId:/);
    assert.doesNotMatch(sourceText, /runtimeStack:/);
    assert.doesNotMatch(notationText, /uiDraft:/);
    assert.doesNotMatch(typedText, /selectionState:/);
  } finally {
    await stopServer(secondRun.server);
  }

  const thirdRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSource = await getModel(thirdRun.baseUrl, project.id, sourceModel.path);
    const reopenedTyped = await getModel(thirdRun.baseUrl, project.id, typedModel.path);

    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.equal(reopenedTyped.notation, notation.id);

    console.log(
      "PASS M5-01 manual save validation covers AC-12, explicit save, repeated save or reopen cycles, full P0 round-trip integrity, and transient-state stripping"
    );
  } finally {
    await stopServer(thirdRun.server);
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

async function saveProject(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/save`, {
    method: "POST"
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.result;
}

async function listNotations(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/notations`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.notations;
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
