import assert from "node:assert/strict";
import { once } from "node:events";
import { access, mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-foundation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");

  const firstRun = await startServer(projectsRoot, clientRoot);

  try {
    const landingPage = await fetchText(`${firstRun.baseUrl}/`);
    assert.match(landingPage, /<div id="root"><\/div>/i);

    const workspaceRoute = await fetchText(`${firstRun.baseUrl}/projects/example`);
    assert.match(workspaceRoute, /assets\/app\.js/i);

    const createdA = await createProject(firstRun.baseUrl, "Foundation Alpha");
    await assertPathExists(path.join(projectsRoot, createdA.folderName, "project.yaml"));
    await assertPathExists(path.join(projectsRoot, createdA.folderName, "models"));

    const manifestText = await readFile(path.join(projectsRoot, createdA.folderName, "project.yaml"), "utf8");
    assert.match(manifestText, /^id: project-/m);
    assert.match(manifestText, /^name: Foundation Alpha$/m);

    const createdB = await createProject(firstRun.baseUrl, "Foundation Beta");
    const listAfterCreate = await fetchJson(`${firstRun.baseUrl}/api/projects`);
    assert.equal(listAfterCreate.projects.length, 2);

    const openedProject = await fetchJson(`${firstRun.baseUrl}/api/projects/${createdA.id}`);
    assert.equal(openedProject.project.id, createdA.id);
    assert.equal(openedProject.project.manifestPath, "project.yaml");

    const initialTree = await fetchJson(`${firstRun.baseUrl}/api/projects/${createdA.id}/tree`);
    assert.ok(treeContainsPath(initialTree.tree, "project.yaml"));
    assert.ok(treeContainsPath(initialTree.tree, "models"));

    const modelDir = path.join(projectsRoot, createdA.folderName, "models", "research");
    await mkdir(modelDir, { recursive: true });
    await writeFile(
      path.join(modelDir, "map-01.yaml"),
      "id: model-001\nname: Research Map\nnotation: freeform\nnodes: []\nedges: []\nframes: []\n",
      "utf8"
    );

    const refreshedTree = await fetchJson(`${firstRun.baseUrl}/api/projects/${createdA.id}/tree`);
    assert.ok(treeContainsPath(refreshedTree.tree, "models/research"));
    assert.ok(treeContainsPath(refreshedTree.tree, "models/research/map-01.yaml"));
  } finally {
    await stopServer(firstRun.server);
  }

  const secondRun = await startServer(projectsRoot, clientRoot);

  try {
    const projects = await fetchJson(`${secondRun.baseUrl}/api/projects`);
    assert.equal(projects.projects.length, 2);

    const reopened = await fetchJson(`${secondRun.baseUrl}/api/projects/${projects.projects[0].id}`);
    assert.ok(reopened.project);

    const reopenedTree = await fetchJson(`${secondRun.baseUrl}/api/projects/${projects.projects[0].id}/tree`);
    assert.ok(treeContainsPath(reopenedTree.tree, "project.yaml"));
  } finally {
    await stopServer(secondRun.server);
  }

  console.log("PASS foundation validation create/open/tree/restart scenario");
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

async function assertPathExists(targetPath) {
  await access(targetPath);
}
