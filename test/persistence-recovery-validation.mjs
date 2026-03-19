import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-m5-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");

  let project;
  let sourceModel;
  let detailModel;
  let typedModel;
  let brokenModel;
  let notation;
  let stepUpTargetPath;
  let frameId;
  let actorNodeId;
  let capabilityNodeId;

  const firstRun = await startServer(projectsRoot, clientRoot);

  try {
    project = await createProject(firstRun.baseUrl, "Persistence Recovery Validation Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml", null);
    detailModel = await createModel(firstRun.baseUrl, project.id, "Capability Detail", sourceModel.path, null);
    brokenModel = await createModel(firstRun.baseUrl, project.id, "Broken Draft", sourceModel.path, null);

    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 96, y: 140 }
    });
    actorNodeId = actorNode.id;
    const capabilityNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Fulfillment",
      position: { x: 336, y: 196 }
    });
    capabilityNodeId = capabilityNode.id;

    const edge = await createEdge(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, capabilityNode.id);
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Commerce Context",
      description: "Persistence plus recovery validation source",
      nodeIds: [actorNode.id, capabilityNode.id]
    });
    frameId = frame.id;

    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      drilldowns: [detailModel.path],
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

    const firstStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    stepUpTargetPath = firstStepUp.link.model;

    notation = (await createNotation(firstRun.baseUrl, project.id, sourceModel.path)).notation;
    typedModel = await createModel(firstRun.baseUrl, project.id, "Operations Typed", sourceModel.path, notation.id);

    const typedNode = await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Typed Actor",
      position: { x: 148, y: 164 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    const firstSave = await saveProject(firstRun.baseUrl, project.id);

    assert.equal(edge.id.length > 0, true);
    assert.equal(typedNode.typing?.typeId, "actor");
    assert.equal(firstSave.modelCount, 5);
    assert.equal(firstSave.notationCount, 1);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedProject = await getProject(secondRun.baseUrl, project.id);
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedDetail = await getModel(secondRun.baseUrl, project.id, detailModel.path);
    const reopenedUpper = await getModel(secondRun.baseUrl, project.id, stepUpTargetPath);
    const reopenedTyped = await getModel(secondRun.baseUrl, project.id, typedModel.path);
    const notations = await listNotations(secondRun.baseUrl, project.id);
    const tree = await getProjectTree(secondRun.baseUrl, project.id);
    const secondSave = await saveProject(secondRun.baseUrl, project.id);

    assert.equal(reopenedProject.defaultModel, sourceModel.path);
    assert.equal(reopenedSource.nodes.length, 2);
    assert.equal(reopenedSource.edges.length, 1);
    assert.equal(reopenedSource.frames[0]?.id, frameId);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [detailModel.path]);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.equal(reopenedDetail.path, detailModel.path);
    assert.equal(reopenedUpper.path, stepUpTargetPath);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.deepEqual(reopenedTyped.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.equal(notations.length, 1);
    assert.ok(treeContainsPath(tree, sourceModel.path));
    assert.ok(treeContainsPath(tree, detailModel.path));
    assert.ok(treeContainsPath(tree, stepUpTargetPath));
    assert.ok(treeContainsPath(tree, typedModel.path));
    assert.ok(treeContainsPath(tree, notation.path));
    assert.ok(treeContainsPath(tree, brokenModel.path));
    assert.equal(secondSave.modelCount, 5);
    assert.equal(secondSave.notationCount, 1);
  } finally {
    await stopServer(secondRun.server);
  }

  const projectRoot = path.join(projectsRoot, project.folderName);
  await writeFile(
    path.join(projectRoot, brokenModel.path),
    "id: broken-model\nname: Broken Draft\nnotation: freeform\nnodes: [\n",
    "utf8"
  );
  await rm(path.join(projectRoot, detailModel.path), { force: true });
  await rm(path.join(projectRoot, stepUpTargetPath), { force: true });
  await rm(path.join(projectRoot, notation.path), { force: true });

  const thirdRun = await startServer(projectsRoot, clientRoot);

  try {
    const projects = await listProjects(thirdRun.baseUrl);
    const reopenedProject = await getProject(thirdRun.baseUrl, project.id);
    const reopenedSource = await getModel(thirdRun.baseUrl, project.id, sourceModel.path);
    const reopenedTyped = await getModel(thirdRun.baseUrl, project.id, typedModel.path);
    const brokenModelResponse = await getModelResponse(thirdRun.baseUrl, project.id, brokenModel.path);
    const missingDetailResponse = await getModelResponse(thirdRun.baseUrl, project.id, detailModel.path);
    const missingStepUpResponse = await stepUpFrameResponse(
      thirdRun.baseUrl,
      project.id,
      sourceModel.path,
      frameId,
      "default"
    );
    const notations = await listNotations(thirdRun.baseUrl, project.id);
    const tree = await getProjectTree(thirdRun.baseUrl, project.id);
    const fallbackNode = await createNode(thirdRun.baseUrl, project.id, typedModel.path, {
      label: "Recovered Freeform Node",
      position: { x: 320, y: 252 }
    });
    const regeneratedStepUp = await stepUpFrame(thirdRun.baseUrl, project.id, sourceModel.path, frameId, "regenerate");
    const sourceText = await readFile(path.join(projectRoot, sourceModel.path), "utf8");

    assert.equal(projects.length, 1);
    assert.equal(reopenedProject.defaultModel, sourceModel.path);
    assert.equal(reopenedSource.nodes[0]?.id, actorNodeId);
    assert.equal(reopenedSource.nodes[1]?.id, capabilityNodeId);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [detailModel.path]);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.equal(reopenedTyped.nodes.length, 1);
    assert.equal(brokenModelResponse.status, 400);
    assert.match(brokenModelResponse.payload.error ?? "", /invalid model document/i);
    assert.equal(missingDetailResponse.status, 404);
    assert.match(missingDetailResponse.payload.error ?? "", /not found/i);
    assert.equal(missingStepUpResponse.status, 404);
    assert.match(missingStepUpResponse.payload.error ?? "", /step-up target model/i);
    assert.equal(notations.length, 0);
    assert.equal(fallbackNode.typing, undefined);
    assert.equal(regeneratedStepUp.link.model, stepUpTargetPath);
    assert.ok(treeContainsPath(tree, sourceModel.path));
    assert.ok(treeContainsPath(tree, typedModel.path));
    assert.ok(treeContainsPath(tree, brokenModel.path));
    assert.match(sourceText, /stepUp:/);
    assert.match(sourceText, /drilldowns:/);
  } finally {
    await stopServer(thirdRun.server);
  }

  const fourthRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSource = await getModel(fourthRun.baseUrl, project.id, sourceModel.path);
    const reopenedTyped = await getModel(fourthRun.baseUrl, project.id, typedModel.path);
    const reopenedUpper = await getModel(fourthRun.baseUrl, project.id, stepUpTargetPath);
    const brokenModelResponse = await getModelResponse(fourthRun.baseUrl, project.id, brokenModel.path);

    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [detailModel.path]);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.equal(reopenedTyped.nodes.length, 2);
    assert.equal(reopenedTyped.nodes[1]?.typing, undefined);
    assert.equal(reopenedUpper.path, stepUpTargetPath);
    assert.equal(brokenModelResponse.status, 400);

    console.log(
      "PASS M5-03 persistence and recovery validation covers AC-12 and AC-13, repeated save or reopen cycles, invalid artifact isolation, recovery-path persistence, and found no blocker-level defects"
    );
  } finally {
    await stopServer(fourthRun.server);
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

async function listProjects(baseUrl) {
  const response = await fetch(`${baseUrl}/api/projects`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.projects;
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

async function getProjectTree(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/tree`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.tree;
}

async function getModel(baseUrl, projectId, modelPath) {
  const response = await getModelResponse(baseUrl, projectId, modelPath);
  assert.equal(response.status, 200);
  return response.payload.model;
}

async function getModelResponse(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);

  return {
    status: response.status,
    payload: await response.json()
  };
}

async function stepUpFrame(baseUrl, projectId, modelPath, frameId, mode) {
  const response = await stepUpFrameResponse(baseUrl, projectId, modelPath, frameId, mode);
  assert.equal(response.status, 200);
  return response.payload;
}

async function stepUpFrameResponse(baseUrl, projectId, modelPath, frameId, mode) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames/${encodeURIComponent(frameId)}/step-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, mode })
  });

  return {
    status: response.status,
    payload: await response.json()
  };
}

function treeContainsPath(node, targetPath) {
  const currentPath = node.path || "";

  if (currentPath === targetPath) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, targetPath)) ?? false;
}
