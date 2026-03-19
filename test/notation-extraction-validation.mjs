import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-notation-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModel;
  let secondModel;
  let firstNotation;
  let secondNotation;
  let sourceNodeIds = [];
  let sourceEdgeId;
  let sourceFrameId;

  try {
    project = await createProject(firstRun.baseUrl, "Notation Validation Workspace");
    sourceModel = await createModel(firstRun.baseUrl, project.id, "Capability Map", "project.yaml");

    const actorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Customer",
      position: { x: 96, y: 140 }
    });
    const duplicateActorNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Partner",
      position: { x: 320, y: 148 }
    });
    const eventNode = await createNode(firstRun.baseUrl, project.id, sourceModel.path, {
      label: "Order placed",
      position: { x: 540, y: 212 }
    });
    sourceNodeIds = [actorNode.id, duplicateActorNode.id, eventNode.id];

    const edge = await createEdge(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, eventNode.id);
    sourceEdgeId = edge.id;
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModel.path, {
      name: "Commerce flow",
      description: "Must survive notation extraction intact",
      nodeIds: [actorNode.id, duplicateActorNode.id, eventNode.id]
    });
    sourceFrameId = frame.id;

    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, actorNode.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, duplicateActorNode.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    await updateNode(firstRun.baseUrl, project.id, sourceModel.path, eventNode.id, {
      typing: {
        typeId: "event",
        colorToken: "rose"
      }
    });

    const firstExtraction = await createNotation(firstRun.baseUrl, project.id, sourceModel.path);
    firstNotation = firstExtraction.notation;

    assert.equal(firstExtraction.model.notation, firstNotation.id);
    assert.equal(firstNotation.name, "Capability Map");
    assert.deepEqual(
      firstNotation.types.map((type) => type.id),
      ["actor", "event"]
    );
    assert.equal(firstExtraction.model.nodes.length, 3);
    assert.equal(firstExtraction.model.edges[0]?.id, sourceEdgeId);
    assert.equal(firstExtraction.model.frames[0]?.id, sourceFrameId);
    assert.deepEqual(
      firstExtraction.model.nodes.map((node) => node.id),
      sourceNodeIds
    );

    secondModel = await createModel(firstRun.baseUrl, project.id, "Policy Map", sourceModel.path);

    const capabilityNode = await createNode(firstRun.baseUrl, project.id, secondModel.path, {
      label: "Underwriting",
      position: { x: 104, y: 124 }
    });
    const duplicateCapabilityNode = await createNode(firstRun.baseUrl, project.id, secondModel.path, {
      label: "Risk review",
      position: { x: 324, y: 202 }
    });
    const actorNodeTwo = await createNode(firstRun.baseUrl, project.id, secondModel.path, {
      label: "Analyst",
      position: { x: 540, y: 144 }
    });

    await updateNode(firstRun.baseUrl, project.id, secondModel.path, capabilityNode.id, {
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    await updateNode(firstRun.baseUrl, project.id, secondModel.path, duplicateCapabilityNode.id, {
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    await updateNode(firstRun.baseUrl, project.id, secondModel.path, actorNodeTwo.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });

    const secondExtraction = await createNotation(firstRun.baseUrl, project.id, secondModel.path);
    secondNotation = secondExtraction.notation;

    assert.equal(secondExtraction.model.notation, secondNotation.id);
    assert.deepEqual(
      secondNotation.types.map((type) => type.id),
      ["actor", "capability"]
    );
    assert.notEqual(secondNotation.path, firstNotation.path);

    const tree = await getProjectTree(firstRun.baseUrl, project.id);
    assert.ok(treeContainsPath(tree, firstNotation.path));
    assert.ok(treeContainsPath(tree, secondNotation.path));

    const manifestText = await readFile(path.join(projectsRoot, project.folderName, "project.yaml"), "utf8");
    const firstNotationText = await readFile(path.join(projectsRoot, project.folderName, firstNotation.path), "utf8");
    const secondNotationText = await readFile(path.join(projectsRoot, project.folderName, secondNotation.path), "utf8");

    assert.match(manifestText, /notations:/);
    assert.match(manifestText, new RegExp(escapeRegExp(firstNotation.path)));
    assert.match(manifestText, new RegExp(escapeRegExp(secondNotation.path)));
    assert.match(firstNotationText, /^id: capability-map$/m);
    assert.match(firstNotationText, /^name: Capability Map$/m);
    assert.match(firstNotationText, /types:/);
    assert.match(firstNotationText, /color: ['"]#F5C26B['"]/);
    assert.match(firstNotationText, /color: ['"]#F28482['"]/);
    assert.doesNotMatch(firstNotationText, /edges:/);
    assert.doesNotMatch(firstNotationText, /frames:/);
    assert.doesNotMatch(firstNotationText, /position:/);
    assert.match(secondNotationText, /^name: Policy Map$/m);
    assert.match(secondNotationText, /color: ['"]#5BC0BE['"]/);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSource = await getModel(secondRun.baseUrl, project.id, sourceModel.path);
    const reopenedSecond = await getModel(secondRun.baseUrl, project.id, secondModel.path);
    const manifestText = await readFile(path.join(projectsRoot, project.folderName, "project.yaml"), "utf8");

    assert.equal(reopenedSource.notation, firstNotation.id);
    assert.equal(reopenedSecond.notation, secondNotation.id);
    assert.equal(reopenedSource.nodes.length, 3);
    assert.equal(reopenedSource.edges[0]?.id, sourceEdgeId);
    assert.equal(reopenedSource.frames[0]?.id, sourceFrameId);
    assert.deepEqual(
      reopenedSource.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "actor", "event"]
    );
    assert.deepEqual(
      reopenedSecond.nodes.map((node) => node.typing?.typeId ?? null),
      ["capability", "capability", "actor"]
    );
    assert.match(manifestText, /notations:/);

    console.log(
      "PASS M4-02 notation extraction validation covers AC-10, demo step 11, duplicate-type smoke, and reopen persistence without graph regressions"
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
