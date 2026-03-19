import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-late-typing-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let childModel;

  try {
    project = await createProject(firstRun.baseUrl, "Late Typing Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml");

    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 96, y: 132 }
    });
    const capabilityNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Fulfillment",
      position: { x: 312, y: 188 }
    });
    const dataNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Order record",
      position: { x: 520, y: 120 }
    });

    const edge = await createEdge(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, capabilityNode.id);
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Commerce Context",
      description: "Typing should not break this semantic group",
      nodeIds: [actorNode.id, capabilityNode.id]
    });
    childModel = await createModel(firstRun.baseUrl, project.id, "Customer Detail", sourceModel.path);

    const afterLink = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      drilldowns: [childModel.path]
    });
    const afterAssign = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      label: "Customer Actor",
      description: "Primary external participant",
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    const afterSecondAssign = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, capabilityNode.id, {
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    const afterThirdAssign = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, dataNode.id, {
      typing: {
        typeId: "data",
        colorToken: "blue"
      }
    });
    const afterChange = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, capabilityNode.id, {
      typing: {
        typeId: "event",
        colorToken: "rose"
      }
    });
    const afterRemove = await updateNode(firstRun.baseUrl, project.id, sourceModel.path, dataNode.id, {
      typing: null
    });

    assert.deepEqual(afterLink.model.nodes[0]?.drilldowns, [childModel.path]);
    assert.deepEqual(afterAssign.model.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.deepEqual(afterSecondAssign.model.nodes[1]?.typing, {
      typeId: "capability",
      colorToken: "teal"
    });
    assert.deepEqual(afterThirdAssign.model.nodes[2]?.typing, {
      typeId: "data",
      colorToken: "blue"
    });
    assert.deepEqual(afterChange.model.nodes[1]?.typing, {
      typeId: "event",
      colorToken: "rose"
    });
    assert.equal(afterRemove.model.nodes[2]?.typing, undefined);
    assert.equal(afterRemove.model.edges[0]?.id, edge.id);
    assert.equal(afterRemove.model.frames[0]?.id, frame.id);
    assert.deepEqual(afterRemove.model.frames[0]?.nodeIds, [actorNode.id, capabilityNode.id]);
    assert.deepEqual(afterRemove.model.nodes[0]?.drilldowns, [childModel.path]);

    const routeHtml = await fetchText(`${firstRun.baseUrl}/projects/${project.id}`);
    const cssPath = routeHtml.match(/assets\/[^"]+\.css/)?.[0];
    assert.ok(cssPath, "Expected the workspace route to expose a CSS bundle.");

    const cssText = await fetchText(`${firstRun.baseUrl}/${cssPath}`);
    assert.match(cssText, /data-node-type-color[^}]*amber/);
    assert.match(cssText, /data-node-type-color[^}]*teal/);
    assert.match(cssText, /\.type-preview-card/);

    const sourceText = await readFile(path.join(projectsRoot, project.folderName, sourceModel.path), "utf8");
    assert.match(sourceText, /typing:/);
    assert.match(sourceText, /typeId: actor/);
    assert.match(sourceText, /typeId: event/);
    assert.match(sourceText, /colorToken: amber/);
    assert.match(sourceText, /colorToken: rose/);
    assert.doesNotMatch(sourceText, /typeId: data/);
    assert.match(sourceText, /drilldowns:/);
    assert.match(sourceText, /nodeIds:/);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedModel = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedChild = await getModel(secondRun.baseUrl, project.id, childModel.path);

    assert.equal(reopenedModel.nodes.length, 3);
    assert.deepEqual(reopenedModel.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.deepEqual(reopenedModel.nodes[1]?.typing, {
      typeId: "event",
      colorToken: "rose"
    });
    assert.equal(reopenedModel.nodes[2]?.typing, undefined);
    assert.equal(reopenedModel.nodes[0]?.label, "Customer Actor");
    assert.equal(reopenedModel.nodes[0]?.description, "Primary external participant");
    assert.deepEqual(reopenedModel.nodes[0]?.drilldowns, [childModel.path]);
    assert.equal(reopenedModel.edges.length, 1);
    assert.equal(reopenedModel.frames.length, 1);
    assert.deepEqual(reopenedModel.frames[0]?.nodeIds, [reopenedModel.nodes[0].id, reopenedModel.nodes[1].id]);
    assert.equal(reopenedChild.path, childModel.path);

    console.log(
      "PASS M4-01 late typing validation covers AC-9, demo step 10, visual color cues, persistence, and graph-regression smoke"
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

async function fetchText(url) {
  const response = await fetch(url);

  assert.equal(response.ok, true);
  return response.text();
}
