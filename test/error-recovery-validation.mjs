import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-error-recovery-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let secondaryModel;
  let brokenModel;
  let missingDrilldownPath;
  let stepUpTargetPath;
  let typedModel;
  let notation;
  let frameId;

  try {
    project = await createProject(firstRun.baseUrl, "Error Recovery Validation Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml", null);
    secondaryModel = await createModel(firstRun.baseUrl, project.id, "Service Detail", sourceModel.path, null);
    brokenModel = await createModel(firstRun.baseUrl, project.id, "Broken Draft", sourceModel.path, null);
    const drilldownModel = await createModel(firstRun.baseUrl, project.id, "Capability Detail", sourceModel.path, null);
    missingDrilldownPath = drilldownModel.path;

    const parentNodeResult = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Capability",
      position: { x: 120, y: 160 }
    });
    const siblingNodeResult = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Operations",
      position: { x: 360, y: 220 }
    });
    const parentNode = parentNodeResult.node;
    const siblingNode = siblingNodeResult.node;

    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, parentNode.id, {
      drilldowns: [drilldownModel.path],
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Revenue Operations",
      description: "Recovery path validation source",
      nodeIds: [parentNode.id, siblingNode.id]
    });
    frameId = frame.id;

    const firstStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "default");
    stepUpTargetPath = firstStepUp.link.model;

    notation = (await createNotation(firstRun.baseUrl, project.id, sourceModel.path)).notation;
    typedModel = await createModel(firstRun.baseUrl, project.id, "Typed Recovery Map", sourceModel.path, notation.id);

    await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Typed actor",
      position: { x: 180, y: 150 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    const projectRoot = path.join(projectsRoot, project.folderName);
    const brokenModelAbsolutePath = path.join(projectRoot, brokenModel.path);
    const missingDrilldownAbsolutePath = path.join(projectRoot, drilldownModel.path);
    const stepUpAbsolutePath = path.join(projectRoot, stepUpTargetPath);
    const notationAbsolutePath = path.join(projectRoot, notation.path);

    await writeFile(brokenModelAbsolutePath, "id: broken-model\nname: Broken Draft\nnotation: freeform\nnodes: [\n", "utf8");
    await rm(missingDrilldownAbsolutePath, { force: true });
    await rm(stepUpAbsolutePath, { force: true });
    await rm(notationAbsolutePath, { force: true });

    const invalidModelResponse = await getModelResponse(firstRun.baseUrl, project.id, brokenModel.path);
    assert.equal(invalidModelResponse.status, 400);
    assert.match(invalidModelResponse.payload.error ?? "", /invalid model document/i);

    const missingDrilldownResponse = await getModelResponse(firstRun.baseUrl, project.id, drilldownModel.path);
    assert.equal(missingDrilldownResponse.status, 404);
    assert.match(missingDrilldownResponse.payload.error ?? "", /not found/i);

    const missingStepUpResponse = await stepUpFrameResponse(
      firstRun.baseUrl,
      project.id,
      sourceModel.path,
      frame.id,
      "default"
    );
    assert.equal(missingStepUpResponse.status, 404);
    assert.match(missingStepUpResponse.payload.error ?? "", /step-up target model/i);

    const recoveredStepUp = await stepUpFrame(firstRun.baseUrl, project.id, sourceModel.path, frame.id, "regenerate");
    assert.equal(recoveredStepUp.link.model, stepUpTargetPath);
    assert.equal(recoveredStepUp.upperModel.path, stepUpTargetPath);

    const reopenedSource = await getModel(firstRun.baseUrl, project.id, sourceModel.path);
    const reopenedSecondary = await getModel(firstRun.baseUrl, project.id, secondaryModel.path);
    const reopenedTyped = await getModel(firstRun.baseUrl, project.id, typedModel.path);
    const notations = await listNotations(firstRun.baseUrl, project.id);
    const tree = await getProjectTree(firstRun.baseUrl, project.id);
    const projects = await listProjects(firstRun.baseUrl);
    const fallbackNode = await createNode(firstRun.baseUrl, project.id, typedModel.path, {
      label: "Fallback node",
      position: { x: 300, y: 240 }
    });

    assert.equal(projects.length, 1);
    assert.equal(reopenedSource.frames[0]?.id, frameId);
    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [missingDrilldownPath]);
    assert.equal(reopenedSecondary.path, secondaryModel.path);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.equal(notations.length, 0);
    assert.equal(fallbackNode.node.typing, undefined);
    assert.ok(treeContainsPath(tree, sourceModel.path));
    assert.ok(treeContainsPath(tree, secondaryModel.path));
    assert.ok(treeContainsPath(tree, brokenModel.path));
    assert.ok(treeContainsPath(tree, typedModel.path));
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedTyped = await getModel(secondRun.baseUrl, project.id, typedModel.path);
    const reopenedUpper = await getModel(secondRun.baseUrl, project.id, stepUpTargetPath);
    const brokenModelResponse = await getModelResponse(secondRun.baseUrl, project.id, brokenModel.path);
    const sourceText = await readFile(path.join(projectsRoot, project.folderName, sourceModel.path), "utf8");

    assert.equal(reopenedSource.frames[0]?.stepUp?.model, stepUpTargetPath);
    assert.deepEqual(reopenedSource.nodes[0]?.drilldowns, [missingDrilldownPath]);
    assert.equal(reopenedTyped.notation, notation.id);
    assert.equal(reopenedTyped.nodes.length, 2);
    assert.equal(reopenedTyped.nodes[1]?.typing, undefined);
    assert.equal(reopenedUpper.path, stepUpTargetPath);
    assert.equal(brokenModelResponse.status, 400);
    assert.match(brokenModelResponse.payload.error ?? "", /invalid model document/i);
    assert.match(sourceText, /stepUp:/);
    assert.match(sourceText, /drilldowns:/);

    console.log(
      "PASS M5-02 recovery validation covers AC-13, invalid YAML isolation, missing drill-down and step-up recovery, missing notation freeform fallback, and workspace continuity after reopen"
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

async function listProjects(baseUrl) {
  const response = await fetch(`${baseUrl}/api/projects`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.projects;
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
  return payload.model;
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

async function getProjectTree(baseUrl, projectId) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/tree`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.tree;
}

async function getModel(baseUrl, projectId, modelPath) {
  const { status, payload } = await getModelResponse(baseUrl, projectId, modelPath);

  assert.equal(status, 200);
  return payload.model;
}

async function getModelResponse(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);
  return {
    status: response.status,
    payload: await response.json()
  };
}

async function stepUpFrame(baseUrl, projectId, modelPath, frameId, mode) {
  const { status, payload } = await stepUpFrameResponse(baseUrl, projectId, modelPath, frameId, mode);

  assert.equal(status, 200);
  return payload;
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
