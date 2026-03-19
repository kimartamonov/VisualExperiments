import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";
import {
  createNavigationState,
  getNavigationBreadcrumbs,
  navigateBack,
  navigateToBreadcrumb,
  openNavigationTarget,
  toNavigationTarget
} from "../dist/server/navigation.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-step-up-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const { server, baseUrl } = await startServer(projectsRoot, clientRoot);

  try {
    const project = await createProject(baseUrl, "Hierarchy Workspace");
    const sourceModel = await createModel(baseUrl, project.id, "Capability Map", "project.yaml");
    const firstNode = await createNode(baseUrl, project.id, sourceModel.path, "Billing", { x: 120, y: 160 });
    const secondNode = await createNode(baseUrl, project.id, sourceModel.path, "Invoices", { x: 360, y: 220 });
    const frame = await createFrame(baseUrl, project.id, sourceModel.path, {
      name: "Revenue Operations",
      description: "Upper-level candidate",
      nodeIds: [firstNode.id, secondNode.id]
    });

    const firstStepUp = await stepUpFrame(baseUrl, project.id, sourceModel.path, frame.id, "default");

    assert.equal(firstStepUp.created, true);
    assert.equal(firstStepUp.regenerated, false);
    assert.equal(firstStepUp.sourceModel.frames[0]?.stepUp?.model, firstStepUp.link.model);
    assert.equal(firstStepUp.upperModel.nodes[0]?.id, firstStepUp.link.nodeId);
    assert.equal(firstStepUp.upperModel.nodes[0]?.label, "Revenue Operations");
    assert.match(firstStepUp.upperModel.nodes[0]?.description ?? "", /nodeCount=2/);

    await updateFrame(baseUrl, project.id, sourceModel.path, frame.id, {
      name: "Revenue Ops Updated",
      description: "Manual refresh should be explicit",
      nodeIds: [firstNode.id]
    });

    const secondStepUp = await stepUpFrame(baseUrl, project.id, sourceModel.path, frame.id, "default");

    assert.equal(secondStepUp.created, false);
    assert.equal(secondStepUp.regenerated, false);
    assert.deepEqual(secondStepUp.link, firstStepUp.link);
    assert.equal(secondStepUp.upperModel.nodes[0]?.label, "Revenue Operations");
    assert.match(secondStepUp.upperModel.nodes[0]?.description ?? "", /nodeCount=2/);

    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(secondStepUp.sourceModel.path, secondStepUp.sourceModel.name),
      "reset"
    );
    navigationState = openNavigationTarget(
      navigationState,
      toNavigationTarget(secondStepUp.upperModel.path, secondStepUp.upperModel.name),
      "push"
    );

    const backNavigation = navigateBack(navigationState);
    assert.equal(backNavigation.target?.modelPath, sourceModel.path);
    assert.deepEqual(
      getNavigationBreadcrumbs(backNavigation.state).map((target) => target.modelPath),
      [sourceModel.path]
    );

    const breadcrumbNavigation = navigateToBreadcrumb(navigationState, sourceModel.path);
    assert.equal(breadcrumbNavigation.target?.modelPath, sourceModel.path);

    const upperModelAbsolutePath = path.join(projectsRoot, project.folderName, firstStepUp.link.model);
    await rm(upperModelAbsolutePath, { force: true });

    const brokenOpen = await fetch(
      `${baseUrl}/api/projects/${project.id}/models?path=${encodeURIComponent(firstStepUp.link.model)}`
    );
    const brokenPayload = await brokenOpen.json();

    assert.equal(brokenOpen.status, 404);
    assert.match(brokenPayload.error ?? "", /was not found/i);

    const brokenStepUp = await fetch(`${baseUrl}/api/projects/${project.id}/frames/${encodeURIComponent(frame.id)}/step-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        modelPath: sourceModel.path,
        mode: "default"
      })
    });
    const brokenStepUpPayload = await brokenStepUp.json();

    assert.equal(brokenStepUp.status, 404);
    assert.match(brokenStepUpPayload.error ?? "", /step-up target model/i);

    const regeneratedStepUp = await stepUpFrame(baseUrl, project.id, sourceModel.path, frame.id, "regenerate");
    const reopenedSource = await getModel(baseUrl, project.id, sourceModel.path);
    const reopenedUpperModel = await getModel(baseUrl, project.id, regeneratedStepUp.link.model);
    const sourceModelText = await readFile(path.join(projectsRoot, project.folderName, sourceModel.path), "utf8");

    assert.equal(regeneratedStepUp.created, false);
    assert.equal(regeneratedStepUp.regenerated, true);
    assert.deepEqual(regeneratedStepUp.link, firstStepUp.link);
    assert.equal(regeneratedStepUp.upperModel.nodes[0]?.id, firstStepUp.link.nodeId);
    assert.equal(regeneratedStepUp.upperModel.nodes[0]?.label, "Revenue Ops Updated");
    assert.match(regeneratedStepUp.upperModel.nodes[0]?.description ?? "", /nodeCount=1/);
    assert.match(regeneratedStepUp.upperModel.nodes[0]?.description ?? "", /Manual refresh should be explicit/);
    assert.deepEqual(reopenedSource.frames[0]?.stepUp, regeneratedStepUp.link);
    assert.equal(reopenedUpperModel.nodes[0]?.id, regeneratedStepUp.link.nodeId);
    assert.match(sourceModelText, /stepUp:/);

    console.log(
      "PASS M3-05 validation covers create or reuse step-up, explicit regeneration, navigation context, persistence, and broken-target recovery"
    );
  } finally {
    await stopServer(server);
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

async function createNode(baseUrl, projectId, modelPath, label, position) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, label, position })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  return payload.node;
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

async function updateFrame(baseUrl, projectId, modelPath, frameId, payload) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/frames/${encodeURIComponent(frameId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ modelPath, ...payload })
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  return result.model;
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
