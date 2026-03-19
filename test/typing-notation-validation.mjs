import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-m4-validation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const firstRun = await startServer(projectsRoot, clientRoot);

  let project;
  let sourceModelA;
  let sourceModelB;
  let notationA;
  let notationB;
  let typedModelA;
  let typedModelB;
  let sourceAEdgeId;
  let sourceAFrameId;

  try {
    project = await createProject(firstRun.baseUrl, "Typing Notation Validation Workspace");
    assert.deepEqual(await listNotations(firstRun.baseUrl, project.id), []);

    sourceModelA = await createModel(firstRun.baseUrl, project.id, "Commerce Map", "project.yaml", null);

    const customerNode = await createNode(firstRun.baseUrl, project.id, sourceModelA.path, {
      label: "Customer",
      position: { x: 96, y: 132 }
    });
    const fulfillmentNode = await createNode(firstRun.baseUrl, project.id, sourceModelA.path, {
      label: "Fulfillment",
      position: { x: 320, y: 212 }
    });
    const orderNode = await createNode(firstRun.baseUrl, project.id, sourceModelA.path, {
      label: "Order Event",
      position: { x: 544, y: 156 }
    });

    const edge = await createEdge(firstRun.baseUrl, project.id, sourceModelA.path, customerNode.id, orderNode.id);
    sourceAEdgeId = edge.id;
    const frame = await createFrame(firstRun.baseUrl, project.id, sourceModelA.path, {
      name: "Commerce Flow",
      description: "Typing and notation must preserve graph structure",
      nodeIds: [customerNode.id, fulfillmentNode.id, orderNode.id]
    });
    sourceAFrameId = frame.id;

    const afterTypingA = await updateNode(firstRun.baseUrl, project.id, sourceModelA.path, customerNode.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    const afterTypingB = await updateNode(firstRun.baseUrl, project.id, sourceModelA.path, fulfillmentNode.id, {
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });
    const afterTypingC = await updateNode(firstRun.baseUrl, project.id, sourceModelA.path, orderNode.id, {
      typing: {
        typeId: "event",
        colorToken: "rose"
      }
    });

    assert.deepEqual(afterTypingA.model.nodes[0]?.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.deepEqual(afterTypingB.model.nodes[1]?.typing, {
      typeId: "capability",
      colorToken: "teal"
    });
    assert.deepEqual(afterTypingC.model.nodes[2]?.typing, {
      typeId: "event",
      colorToken: "rose"
    });
    assert.equal(afterTypingC.model.edges[0]?.id, sourceAEdgeId);
    assert.equal(afterTypingC.model.frames[0]?.id, sourceAFrameId);

    const extractionA = await createNotation(firstRun.baseUrl, project.id, sourceModelA.path);
    notationA = extractionA.notation;
    assert.equal(extractionA.model.notation, notationA.id);
    assert.deepEqual(
      notationA.types.map((type) => type.id),
      ["actor", "capability", "event"]
    );

    typedModelA = await createModel(firstRun.baseUrl, project.id, "Commerce Typed View", sourceModelA.path, notationA.id);
    assert.equal(typedModelA.notation, notationA.id);

    const typedAFirstNode = await createNode(firstRun.baseUrl, project.id, typedModelA.path, {
      label: "Customer Touchpoint",
      position: { x: 128, y: 144 },
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    const typedASecondNode = await createNode(firstRun.baseUrl, project.id, typedModelA.path, {
      label: "Fulfillment Capability",
      position: { x: 356, y: 204 },
      typing: {
        typeId: "capability",
        colorToken: "teal"
      }
    });

    assert.deepEqual(typedAFirstNode.typing, {
      typeId: "actor",
      colorToken: "amber"
    });
    assert.deepEqual(typedASecondNode.typing, {
      typeId: "capability",
      colorToken: "teal"
    });

    sourceModelB = await createModel(firstRun.baseUrl, project.id, "Policy Map", sourceModelA.path, null);

    const analystNode = await createNode(firstRun.baseUrl, project.id, sourceModelB.path, {
      label: "Analyst",
      position: { x: 112, y: 136 }
    });
    const policyNode = await createNode(firstRun.baseUrl, project.id, sourceModelB.path, {
      label: "Policy Record",
      position: { x: 340, y: 188 }
    });

    await updateNode(firstRun.baseUrl, project.id, sourceModelB.path, analystNode.id, {
      typing: {
        typeId: "actor",
        colorToken: "amber"
      }
    });
    const afterSecondWorkflowTyping = await updateNode(firstRun.baseUrl, project.id, sourceModelB.path, policyNode.id, {
      typing: {
        typeId: "data",
        colorToken: "blue"
      }
    });

    assert.deepEqual(
      afterSecondWorkflowTyping.model.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "data"]
    );

    const extractionB = await createNotation(firstRun.baseUrl, project.id, sourceModelB.path);
    notationB = extractionB.notation;
    assert.equal(extractionB.model.notation, notationB.id);
    assert.deepEqual(
      notationB.types.map((type) => type.id),
      ["actor", "data"]
    );

    typedModelB = await createModel(firstRun.baseUrl, project.id, "Policy Typed View", sourceModelB.path, notationB.id);
    assert.equal(typedModelB.notation, notationB.id);

    const typedBNode = await createNode(firstRun.baseUrl, project.id, typedModelB.path, {
      label: "Policy Artifact",
      position: { x: 160, y: 152 },
      typing: {
        typeId: "data",
        colorToken: "blue"
      }
    });
    assert.deepEqual(typedBNode.typing, {
      typeId: "data",
      colorToken: "blue"
    });

    const listedNotations = await listNotations(firstRun.baseUrl, project.id);
    const tree = await getProjectTree(firstRun.baseUrl, project.id);
    const manifestText = await readFile(path.join(projectsRoot, project.folderName, "project.yaml"), "utf8");
    const sourceAText = await readFile(path.join(projectsRoot, project.folderName, sourceModelA.path), "utf8");
    const sourceBText = await readFile(path.join(projectsRoot, project.folderName, sourceModelB.path), "utf8");
    const typedAText = await readFile(path.join(projectsRoot, project.folderName, typedModelA.path), "utf8");
    const typedBText = await readFile(path.join(projectsRoot, project.folderName, typedModelB.path), "utf8");

    assert.equal(listedNotations.length, 2);
    assert.deepEqual(
      listedNotations.map((notation) => notation.id),
      [notationA.id, notationB.id]
    );
    assert.ok(treeContainsPath(tree, sourceModelA.path));
    assert.ok(treeContainsPath(tree, sourceModelB.path));
    assert.ok(treeContainsPath(tree, notationA.path));
    assert.ok(treeContainsPath(tree, notationB.path));
    assert.ok(treeContainsPath(tree, typedModelA.path));
    assert.ok(treeContainsPath(tree, typedModelB.path));
    assert.match(manifestText, /notations:/);
    assert.match(manifestText, new RegExp(escapeRegExp(notationA.path)));
    assert.match(manifestText, new RegExp(escapeRegExp(notationB.path)));
    assert.match(sourceAText, /typing:/);
    assert.match(sourceAText, /typeId: actor/);
    assert.match(sourceAText, /typeId: capability/);
    assert.match(sourceAText, /typeId: event/);
    assert.match(sourceAText, /edges:/);
    assert.match(sourceAText, /frames:/);
    assert.match(sourceBText, /typeId: data/);
    assert.match(typedAText, new RegExp(`^notation: ${notationA.id}$`, "m"));
    assert.match(typedAText, /typeId: actor/);
    assert.match(typedAText, /typeId: capability/);
    assert.match(typedBText, new RegExp(`^notation: ${notationB.id}$`, "m"));
    assert.match(typedBText, /typeId: data/);
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedSourceA = await getModel(secondRun.baseUrl, project.id, sourceModelA.path);
    const reopenedSourceB = await getModel(secondRun.baseUrl, project.id, sourceModelB.path);
    const reopenedTypedA = await getModel(secondRun.baseUrl, project.id, typedModelA.path);
    const reopenedTypedB = await getModel(secondRun.baseUrl, project.id, typedModelB.path);
    const reopenedNotations = await listNotations(secondRun.baseUrl, project.id);
    const tree = await getProjectTree(secondRun.baseUrl, project.id);

    assert.deepEqual(
      reopenedSourceA.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "capability", "event"]
    );
    assert.deepEqual(
      reopenedSourceB.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "data"]
    );
    assert.equal(reopenedSourceA.notation, notationA.id);
    assert.equal(reopenedSourceB.notation, notationB.id);
    assert.equal(reopenedSourceA.edges[0]?.id, sourceAEdgeId);
    assert.equal(reopenedSourceA.frames[0]?.id, sourceAFrameId);
    assert.equal(reopenedTypedA.notation, notationA.id);
    assert.equal(reopenedTypedB.notation, notationB.id);
    assert.deepEqual(
      reopenedTypedA.nodes.map((node) => node.typing?.typeId ?? null),
      ["actor", "capability"]
    );
    assert.deepEqual(
      reopenedTypedB.nodes.map((node) => node.typing?.typeId ?? null),
      ["data"]
    );
    assert.equal(reopenedNotations.length, 2);
    assert.ok(treeContainsPath(tree, notationA.path));
    assert.ok(treeContainsPath(tree, notationB.path));
    assert.ok(treeContainsPath(tree, typedModelA.path));
    assert.ok(treeContainsPath(tree, typedModelB.path));

    console.log(
      "PASS M4-04 typing and notation validation covers AC-9, AC-10, AC-11, demo steps 10-13, repeated workflow smoke, reopen persistence, and found no blocker-level defects"
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
