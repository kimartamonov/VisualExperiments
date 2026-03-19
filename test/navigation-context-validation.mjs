import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../dist/server/app.js";
import {
  createNavigationState,
  dropNavigationTarget,
  getNavigationBreadcrumbs,
  navigateBack,
  navigateToBreadcrumb,
  openNavigationTarget,
  toNavigationTarget
} from "../dist/server/navigation.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-navigation-"));
  const clientRoot = path.resolve(process.cwd(), "dist", "client");
  const { server, baseUrl } = await startServer(projectsRoot, clientRoot);

  try {
    const project = await createProject(baseUrl, "Navigation Workspace");
    const modelA = await createModel(baseUrl, project.id, "Main Map", "project.yaml");
    const modelB = await createModel(baseUrl, project.id, "Detail Map", "models");
    const modelC = await createModel(baseUrl, project.id, "Upper Map", "models");

    const openedA = await getModel(baseUrl, project.id, modelA.path);
    const openedB = await getModel(baseUrl, project.id, modelB.path);
    const openedC = await getModel(baseUrl, project.id, modelC.path);
    const tree = await fetchJson(`${baseUrl}/api/projects/${project.id}/tree`);

    assert.ok(treeContainsPath(tree.tree, modelA.path));
    assert.ok(treeContainsPath(tree.tree, modelB.path));
    assert.ok(treeContainsPath(tree.tree, modelC.path));

    let navigationState = createNavigationState();
    navigationState = openNavigationTarget(navigationState, toNavigationTarget(openedA.path, openedA.name), "reset");
    navigationState = openNavigationTarget(navigationState, toNavigationTarget(openedB.path, openedB.name), "push");
    navigationState = openNavigationTarget(navigationState, toNavigationTarget(openedC.path, openedC.name), "push");

    assert.deepEqual(
      getNavigationBreadcrumbs(navigationState).map((target) => target.modelPath),
      [modelA.path, modelB.path, modelC.path]
    );

    const backNavigation = navigateBack(navigationState);
    const backModel = await getModel(baseUrl, project.id, backNavigation.target.modelPath);

    assert.equal(backModel.path, modelB.path);
    assert.deepEqual(
      getNavigationBreadcrumbs(backNavigation.state).map((target) => target.modelPath),
      [modelA.path, modelB.path]
    );

    const breadcrumbNavigation = navigateToBreadcrumb(navigationState, modelA.path);
    const breadcrumbModel = await getModel(baseUrl, project.id, breadcrumbNavigation.target.modelPath);

    assert.equal(breadcrumbModel.path, modelA.path);
    assert.deepEqual(
      getNavigationBreadcrumbs(breadcrumbNavigation.state).map((target) => target.modelPath),
      [modelA.path]
    );

    const recoveredState = dropNavigationTarget(navigationState, modelB.path);

    assert.deepEqual(
      getNavigationBreadcrumbs(recoveredState).map((target) => target.modelPath),
      [modelA.path, modelC.path]
    );

    const projectRoot = path.join(projectsRoot, project.folderName);
    const mainModelText = await readFile(path.join(projectRoot, modelA.path), "utf8");
    const detailModelText = await readFile(path.join(projectRoot, modelB.path), "utf8");

    assert.doesNotMatch(mainModelText, /breadcrumb|navigation|backStack/i);
    assert.doesNotMatch(detailModelText, /breadcrumb|navigation|backStack/i);

    console.log(
      "PASS M3-03 navigation context validation covers breadcrumbs, back stack, recovery path, and no YAML persistence"
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

async function getModel(baseUrl, projectId, modelPath) {
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/models?path=${encodeURIComponent(modelPath)}`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  return payload.model;
}

async function fetchJson(url) {
  const response = await fetch(url);

  assert.equal(response.ok, true);
  return response.json();
}

function treeContainsPath(node, targetPath) {
  const currentPath = node.path || "";

  if (currentPath === targetPath) {
    return true;
  }

  return node.children?.some((child) => treeContainsPath(child, targetPath)) ?? false;
}
