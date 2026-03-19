import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";

import { ProjectService, slugify } from "../dist/server/project-service.js";

async function main() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-step-up-spike-"));
  const service = new ProjectService(projectsRoot);
  const project = await service.createProject("Hierarchy Spike");
  const sourceModel = await service.createFreeformModel(project.id, "Capability Map", null);
  const projectRoot = path.join(projectsRoot, project.folderName);

  const firstNode = await service.createNode(project.id, sourceModel.path, {
    label: "Billing",
    position: { x: 120, y: 160 }
  });
  const secondNode = await service.createNode(project.id, sourceModel.path, {
    label: "Invoices",
    position: { x: 360, y: 220 }
  });
  const createdFrame = await service.createFrame(project.id, sourceModel.path, {
    name: "Revenue Operations",
    description: "Upper-level candidate",
    nodeIds: [firstNode.node.id, secondNode.node.id]
  });

  const firstRun = await runStepUpPrototype({
    projectRoot,
    service,
    projectId: project.id,
    sourceModelPath: sourceModel.path,
    frameId: createdFrame.frame.id,
    mode: "default"
  });

  assert.equal(firstRun.created, true);
  assert.equal(firstRun.regenerated, false);
  assert.match(firstRun.link.model, /^models\/abstractions\/revenue-operations/);
  assert.equal(firstRun.upperModel.nodes.length, 1);
  assert.equal(firstRun.upperModel.nodes[0]?.id, firstRun.link.nodeId);
  assert.equal(firstRun.upperModel.nodes[0]?.label, "Revenue Operations");
  assert.match(firstRun.upperModel.nodes[0]?.description ?? "", /Upper-level candidate/);

  const firstAbstractionFiles = await listAbstractionFiles(projectRoot);
  assert.equal(firstAbstractionFiles.length, 1);

  const updatedSource = await service.updateFrame(project.id, sourceModel.path, createdFrame.frame.id, {
    name: "Revenue Ops Updated",
    description: "Manual refresh should be explicit",
    nodeIds: [firstNode.node.id]
  });

  assert.deepEqual(updatedSource.frames[0]?.stepUp, firstRun.link);

  const secondRun = await runStepUpPrototype({
    projectRoot,
    service,
    projectId: project.id,
    sourceModelPath: sourceModel.path,
    frameId: createdFrame.frame.id,
    mode: "default"
  });

  assert.equal(secondRun.created, false);
  assert.equal(secondRun.regenerated, false);
  assert.deepEqual(secondRun.link, firstRun.link);
  assert.equal(secondRun.upperModel.nodes.length, 1);
  assert.equal(secondRun.upperModel.nodes[0]?.label, "Revenue Operations");
  assert.match(secondRun.upperModel.nodes[0]?.description ?? "", /nodeCount=2/);
  assert.deepEqual(await listAbstractionFiles(projectRoot), firstAbstractionFiles);

  const navigationContext = {
    sourceModelPath: sourceModel.path,
    via: {
      type: "step-up",
      frameId: createdFrame.frame.id,
      targetModelPath: secondRun.link.model
    }
  };
  const openedUpperLevel = await service.getModel(project.id, secondRun.link.model);
  const returnedSource = await service.getModel(project.id, navigationContext.sourceModelPath);

  assert.equal(openedUpperLevel.path, secondRun.link.model);
  assert.equal(returnedSource.path, sourceModel.path);
  assert.deepEqual(returnedSource.frames[0]?.stepUp, secondRun.link);

  const regeneratedRun = await runStepUpPrototype({
    projectRoot,
    service,
    projectId: project.id,
    sourceModelPath: sourceModel.path,
    frameId: createdFrame.frame.id,
    mode: "regenerate"
  });

  assert.equal(regeneratedRun.created, false);
  assert.equal(regeneratedRun.regenerated, true);
  assert.deepEqual(regeneratedRun.link, firstRun.link);
  assert.equal(regeneratedRun.upperModel.nodes[0]?.id, firstRun.link.nodeId);
  assert.equal(regeneratedRun.upperModel.nodes[0]?.label, "Revenue Ops Updated");
  assert.match(regeneratedRun.upperModel.nodes[0]?.description ?? "", /nodeCount=1/);
  assert.match(regeneratedRun.upperModel.nodes[0]?.description ?? "", /Manual refresh should be explicit/);

  const reopenedService = new ProjectService(projectsRoot);
  const reopenedSource = await reopenedService.getModel(project.id, sourceModel.path);
  const reopenedUpperLevel = await reopenedService.getModel(project.id, regeneratedRun.link.model);

  assert.deepEqual(reopenedSource.frames[0]?.stepUp, regeneratedRun.link);
  assert.equal(reopenedUpperLevel.nodes[0]?.id, regeneratedRun.link.nodeId);
  assert.equal(reopenedUpperLevel.nodes[0]?.label, "Revenue Ops Updated");

  console.log(
    "PASS M3-02 spike proves create/open-existing/manual-regenerate step-up path without live sync or duplicate generation"
  );
}

await main();

async function runStepUpPrototype({
  projectRoot,
  service,
  projectId,
  sourceModelPath,
  frameId,
  mode
}) {
  const sourceAbsolutePath = path.join(projectRoot, sourceModelPath);
  const sourceModel = loadYamlDocument(await readFile(sourceAbsolutePath, "utf8"));
  const frame = sourceModel.frames.find((candidate) => candidate.id === frameId);
  const hadExistingLink = frame?.stepUp !== null;

  assert.ok(frame, `Frame "${frameId}" must exist for spike validation.`);

  if (frame.stepUp && mode === "default") {
    return {
      created: false,
      regenerated: false,
      link: frame.stepUp,
      upperModel: await service.getModel(projectId, frame.stepUp.model)
    };
  }

  let link = frame.stepUp;
  let upperModelDocument;
  let upperModelPath;
  let representativeNodeId;

  if (!link) {
    upperModelPath = await createUniqueAbstractionPath(projectRoot, frame.name);
    representativeNodeId = `node-${randomUUID()}`;
    upperModelDocument = {
      id: `model-${randomUUID()}`,
      name: `${frame.name} Abstraction`,
      notation: "freeform",
      nodes: [buildRepresentativeNode(frame, representativeNodeId)],
      edges: [],
      frames: []
    };
    link = {
      model: upperModelPath,
      nodeId: representativeNodeId
    };
    frame.stepUp = link;
  } else {
    upperModelPath = link.model;
    representativeNodeId = link.nodeId;
    upperModelDocument = loadYamlDocument(await readFile(path.join(projectRoot, upperModelPath), "utf8"));
    const representativeNode = upperModelDocument.nodes.find((candidate) => candidate.id === representativeNodeId);
    assert.ok(representativeNode, `Representative node "${representativeNodeId}" must exist.`);

    if (mode === "regenerate") {
      Object.assign(representativeNode, buildRepresentativeNode(frame, representativeNodeId));
      upperModelDocument.name = `${frame.name} Abstraction`;
    }
  }

  await mkdir(path.dirname(path.join(projectRoot, upperModelPath)), { recursive: true });
  await writeFile(path.join(projectRoot, upperModelPath), dumpYamlDocument(upperModelDocument), "utf8");
  await writeFile(sourceAbsolutePath, dumpYamlDocument(sourceModel), "utf8");

  return {
    created: !hadExistingLink,
    regenerated: mode === "regenerate",
    link,
    upperModel: await service.getModel(projectId, upperModelPath)
  };
}

function buildRepresentativeNode(frame, nodeId) {
  return {
    id: nodeId,
    label: frame.name,
    description: `Frame ${frame.id}; nodeCount=${frame.nodeIds.length}; ${frame.description}`.trim(),
    position: {
      x: 160,
      y: 120
    }
  };
}

async function createUniqueAbstractionPath(projectRoot, frameName) {
  const abstractionsDirectory = path.join(projectRoot, "models", "abstractions");
  const baseSlug = slugify(frameName, "step-up");
  let attempt = 0;

  while (true) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const relativePath = `models/abstractions/${baseSlug}${suffix}.yaml`;
    const absolutePath = path.join(projectRoot, relativePath);

    try {
      await readFile(absolutePath, "utf8");
      attempt += 1;
    } catch {
      return relativePath;
    }
  }
}

async function listAbstractionFiles(projectRoot) {
  const directory = path.join(projectRoot, "models", "abstractions");

  try {
    return (await readdir(directory)).sort();
  } catch {
    return [];
  }
}

function loadYamlDocument(text) {
  return yaml.load(text);
}

function dumpYamlDocument(document) {
  return `${yaml.dump(document, {
    noRefs: true,
    sortKeys: false,
    lineWidth: -1
  }).trimEnd()}\n`;
}
