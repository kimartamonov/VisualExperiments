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
  let createdModel;

  try {
    createdProject = await createProject(firstRun.baseUrl, "Model Workspace");
    createdModel = await createModel(firstRun.baseUrl, createdProject.id, "Main Map", "project.yaml");

    assert.equal(createdModel.path, "models/main.yaml");
    assert.equal(createdModel.notation, "freeform");
    assert.deepEqual(createdModel.nodes, []);
    assert.deepEqual(createdModel.edges, []);
    assert.deepEqual(createdModel.frames, []);

    const manifestText = await readFile(path.join(projectsRoot, createdProject.folderName, "project.yaml"), "utf8");
    const modelText = await readFile(path.join(projectsRoot, createdProject.folderName, createdModel.path), "utf8");

    assert.match(manifestText, /^defaultModel: models\/main\.yaml$/m);
    assert.match(modelText, /^notation: freeform$/m);
    assert.match(modelText, /^nodes: \[\]$/m);
    assert.match(modelText, /^edges: \[\]$/m);
    assert.match(modelText, /^frames: \[\]$/m);

    const tree = await fetchJson(`${firstRun.baseUrl}/api/projects/${createdProject.id}/tree`);
    assert.ok(treeContainsPath(tree.tree, "models/main.yaml"));

    const reopenedModel = await fetchJson(
      `${firstRun.baseUrl}/api/projects/${createdProject.id}/models?path=${encodeURIComponent(createdModel.path)}`
    );
    assert.equal(reopenedModel.model.path, "models/main.yaml");
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const reopenedProject = await fetchJson(`${secondRun.baseUrl}/api/projects/${createdProject.id}`);
    assert.equal(reopenedProject.project.defaultModel, "models/main.yaml");

    const reopenedModel = await fetchJson(
      `${secondRun.baseUrl}/api/projects/${createdProject.id}/models?path=${encodeURIComponent(createdModel.path)}`
    );
    assert.equal(reopenedModel.model.name, "Main Map");
    assert.equal(reopenedModel.model.notation, "freeform");

    const routeHtml = await fetchText(`${secondRun.baseUrl}/projects/${createdProject.id}`);
    assert.match(routeHtml, /assets\/app\.js/i);
  } finally {
    await stopServer(secondRun.server);
  }

  console.log("PASS freeform bootstrap create/open/reopen scenario");
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
