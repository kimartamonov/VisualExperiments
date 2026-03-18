import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../dist/server/project-service.js";

async function testCreateProjectBootstrap() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);

  const project = await service.createProject("Business Model Canvas");
  const manifestPath = path.join(projectsRoot, project.folderName, "project.yaml");
  const manifestText = await readFile(manifestPath, "utf8");

  assert.equal(project.name, "Business Model Canvas");
  assert.equal(project.manifestPath, "project.yaml");
  assert.equal(project.modelsPath, "models/");
  assert.match(manifestText, /^id: project-/m);
  assert.match(manifestText, /^name: Business Model Canvas$/m);
  assert.doesNotMatch(manifestText, /^defaultModel:/m);
  assert.doesNotMatch(manifestText, /^notations:/m);
}

async function testListAndReopen() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Event Storming");

  const projects = await service.listProjects();
  const reopened = await service.getProject(created.id);

  assert.equal(projects.length, 1);
  assert.equal(projects[0]?.id, created.id);
  assert.equal(reopened.id, created.id);
  assert.equal(reopened.name, "Event Storming");
  assert.equal(reopened.hasModels, false);
}

async function testConflictHandling() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);

  await service.createProject("Service Blueprint");

  await assert.rejects(
    () => service.createProject("service blueprint"),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /already exists/i);
      return true;
    }
  );
}

async function testProjectTreeAndRefresh() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Opportunity Map");
  const projectPath = path.join(projectsRoot, created.folderName);
  const nestedFolder = path.join(projectPath, "models", "research");
  const nestedModelPath = path.join(nestedFolder, "map-01.yaml");

  await mkdir(nestedFolder, { recursive: true });
  await writeFile(nestedModelPath, "id: model-001\nname: Research Map\nnotation: freeform\nnodes: []\nedges: []\nframes: []\n", "utf8");

  const tree = await service.getProjectTree(created.id);
  const modelsNode = tree.children.find((child) => child.path === "models");
  const researchNode = modelsNode?.children?.find((child) => child.path === "models/research");
  const modelNode = researchNode?.children?.find((child) => child.path === "models/research/map-01.yaml");

  assert.equal(tree.kind, "directory");
  assert.equal(tree.path, "");
  assert.ok(tree.children.some((child) => child.path === "project.yaml"));
  assert.ok(modelsNode);
  assert.equal(modelsNode?.kind, "directory");
  assert.ok(researchNode);
  assert.ok(modelNode);
  assert.equal(modelNode?.kind, "file");
}

const cases = [
  ["createProject bootstraps a project folder with manifest and models directory", testCreateProjectBootstrap],
  ["listProjects and getProject read the manifest back from disk", testListAndReopen],
  ["createProject rejects conflicting folder slugs with a readable error", testConflictHandling],
  ["getProjectTree reflects real folders and YAML files after the project changes", testProjectTreeAndRefresh]
];

for (const [name, run] of cases) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}
