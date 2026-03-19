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

async function testCreateFreeformModelAndDefaultModel() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Freeform Studio");

  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const manifestPath = path.join(projectsRoot, created.folderName, "project.yaml");
  const modelPath = path.join(projectsRoot, created.folderName, model.path);
  const manifestText = await readFile(manifestPath, "utf8");
  const modelText = await readFile(modelPath, "utf8");

  assert.equal(model.path, "models/main.yaml");
  assert.equal(model.notation, "freeform");
  assert.deepEqual(model.nodes, []);
  assert.deepEqual(model.edges, []);
  assert.deepEqual(model.frames, []);
  assert.match(manifestText, /^defaultModel: models\/main\.yaml$/m);
  assert.match(modelText, /^notation: freeform$/m);
  assert.match(modelText, /^nodes: \[\]$/m);
  assert.match(modelText, /^edges: \[\]$/m);
  assert.match(modelText, /^frames: \[\]$/m);
}

async function testOpenModelAndSecondaryPlacement() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Freeform Studio");

  await service.createFreeformModel(created.id, "Main Map", null);
  const secondary = await service.createFreeformModel(created.id, "Research Map", "models");
  const reopened = await service.getModel(created.id, secondary.path);

  assert.equal(secondary.path, "models/research-map.yaml");
  assert.equal(reopened.path, "models/research-map.yaml");
  assert.equal(reopened.name, "Research Map");
  assert.equal(reopened.notation, "freeform");
}

async function testNodeLifecycleAndPersistence() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Node Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const modelAbsolutePath = path.join(projectsRoot, created.folderName, model.path);

  const createdNode = await service.createNode(created.id, model.path, {
    position: { x: 48, y: 96 }
  });
  const updatedModel = await service.updateNode(created.id, model.path, createdNode.node.id, {
    label: "Capability",
    description: "Reusable business capability",
    position: { x: 224, y: 182 }
  });
  const reopened = await service.getModel(created.id, model.path);
  const deletedModel = await service.deleteNode(created.id, model.path, createdNode.node.id);
  const modelText = await readFile(modelAbsolutePath, "utf8");

  assert.equal(createdNode.node.label, "Node 1");
  assert.equal(createdNode.model.nodes.length, 1);
  assert.equal(updatedModel.nodes[0]?.label, "Capability");
  assert.equal(updatedModel.nodes[0]?.description, "Reusable business capability");
  assert.deepEqual(updatedModel.nodes[0]?.position, { x: 224, y: 182 });
  assert.deepEqual(reopened.nodes[0], updatedModel.nodes[0]);
  assert.deepEqual(deletedModel.nodes, []);
  assert.match(modelText, /^nodes: \[\]$/m);
}

async function testDeleteNodeCleansDanglingReferences() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Cleanup Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const modelAbsolutePath = path.join(projectsRoot, created.folderName, model.path);

  await writeFile(
    modelAbsolutePath,
    [
      "id: model-cleanup",
      "name: Main Map",
      "notation: freeform",
      "nodes:",
      "  - id: node-a",
      "    label: Alpha",
      "    description: First",
      "    position:",
      "      x: 40",
      "      y: 80",
      "  - id: node-b",
      "    label: Beta",
      "    description: Second",
      "    position:",
      "      x: 280",
      "      y: 120",
      "edges:",
      "  - id: edge-a",
      "    source: node-a",
      "    target: node-b",
      "  - id: edge-b",
      "    source: node-b",
      "    target: node-b",
      "frames:",
      "  - id: frame-a",
      "    name: Focus",
      "    description: Cleanup group",
      "    nodeIds:",
      "      - node-a",
      "      - node-b",
      "    stepUp: null",
      ""
    ].join("\n"),
    "utf8"
  );

  const updatedModel = await service.deleteNode(created.id, model.path, "node-a");
  const reopened = await service.getModel(created.id, model.path);

  assert.equal(updatedModel.nodes.length, 1);
  assert.equal(updatedModel.nodes[0]?.id, "node-b");
  assert.equal(updatedModel.edges.length, 1);
  assert.equal(updatedModel.edges[0]?.id, "edge-b");
  assert.deepEqual(updatedModel.frames[0]?.nodeIds, ["node-b"]);
  assert.deepEqual(reopened, updatedModel);
}

async function testEdgeLifecycleAndPersistence() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Edge Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const firstNode = await service.createNode(created.id, model.path, {
    position: { x: 48, y: 96 }
  });
  const secondNode = await service.createNode(created.id, model.path, {
    position: { x: 260, y: 160 }
  });

  const createdEdge = await service.createEdge(created.id, model.path, {
    source: firstNode.node.id,
    target: secondNode.node.id
  });
  const reopened = await service.getModel(created.id, model.path);
  const afterDelete = await service.deleteEdge(created.id, model.path, createdEdge.edge.id);

  assert.equal(createdEdge.model.edges.length, 1);
  assert.equal(createdEdge.edge.source, firstNode.node.id);
  assert.equal(createdEdge.edge.target, secondNode.node.id);
  assert.deepEqual(reopened.edges[0], createdEdge.edge);
  assert.deepEqual(afterDelete.edges, []);
}

async function testCreateEdgeRejectsMissingNodes() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Edge Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const firstNode = await service.createNode(created.id, model.path, {
    position: { x: 48, y: 96 }
  });

  await assert.rejects(
    () =>
      service.createEdge(created.id, model.path, {
        source: firstNode.node.id,
        target: "node-missing"
      }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /target node/i);
      return true;
    }
  );
}

async function testFrameLifecycleAndPersistence() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Frame Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const firstNode = await service.createNode(created.id, model.path, {
    position: { x: 48, y: 96 }
  });
  const secondNode = await service.createNode(created.id, model.path, {
    position: { x: 260, y: 160 }
  });

  const createdFrame = await service.createFrame(created.id, model.path);
  const updatedModel = await service.updateFrame(created.id, model.path, createdFrame.frame.id, {
    name: "Customer Context",
    description: "Actors grouped for later step-up",
    nodeIds: [firstNode.node.id, secondNode.node.id]
  });
  const reopened = await service.getModel(created.id, model.path);
  const afterDelete = await service.deleteFrame(created.id, model.path, createdFrame.frame.id);

  assert.equal(createdFrame.frame.name, "Frame 1");
  assert.equal(createdFrame.frame.stepUp, null);
  assert.equal(updatedModel.frames[0]?.name, "Customer Context");
  assert.equal(updatedModel.frames[0]?.description, "Actors grouped for later step-up");
  assert.deepEqual(updatedModel.frames[0]?.nodeIds, [firstNode.node.id, secondNode.node.id]);
  assert.equal(updatedModel.frames[0]?.stepUp, null);
  assert.deepEqual(reopened.frames[0], updatedModel.frames[0]);
  assert.deepEqual(afterDelete.frames, []);
  assert.equal(afterDelete.nodes.length, 2);
}

async function testDeleteNodeCleansFrameMembershipOnly() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Frame Studio");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const firstNode = await service.createNode(created.id, model.path, {
    position: { x: 48, y: 96 }
  });
  const secondNode = await service.createNode(created.id, model.path, {
    position: { x: 260, y: 160 }
  });
  const frame = await service.createFrame(created.id, model.path, {
    nodeIds: [firstNode.node.id, secondNode.node.id]
  });

  const updatedModel = await service.deleteNode(created.id, model.path, firstNode.node.id);

  assert.equal(updatedModel.frames.length, 1);
  assert.deepEqual(updatedModel.frames[0]?.nodeIds, [secondNode.node.id]);
  assert.equal(updatedModel.frames[0]?.id, frame.frame.id);
}

async function testFrameStepUpLinkPersistsAcrossMembershipEdits() {
  const projectsRoot = await mkdtemp(path.join(os.tmpdir(), "ve-projects-"));
  const service = new ProjectService(projectsRoot);
  const created = await service.createProject("Step Up Contract");
  const model = await service.createFreeformModel(created.id, "Main Map", null);
  const modelAbsolutePath = path.join(projectsRoot, created.folderName, model.path);

  await writeFile(
    modelAbsolutePath,
    [
      "id: model-step-up",
      "name: Main Map",
      "notation: freeform",
      "nodes:",
      "  - id: node-a",
      "    label: Alpha",
      "    description: First",
      "    position:",
      "      x: 40",
      "      y: 80",
      "  - id: node-b",
      "    label: Beta",
      "    description: Second",
      "    position:",
      "      x: 280",
      "      y: 120",
      "edges: []",
      "frames:",
      "  - id: frame-a",
      "    name: Context",
      "    description: Step-up source",
      "    nodeIds:",
      "      - node-a",
      "      - node-b",
      "    stepUp:",
      "      model: models/abstractions/context.yaml",
      "      nodeId: node-upper",
      ""
    ].join("\n"),
    "utf8"
  );

  const reopened = await service.getModel(created.id, model.path);
  const updated = await service.updateFrame(created.id, model.path, "frame-a", {
    name: "Context Updated",
    nodeIds: ["node-a"]
  });
  const afterDelete = await service.deleteNode(created.id, model.path, "node-a");

  assert.deepEqual(reopened.frames[0]?.stepUp, {
    model: "models/abstractions/context.yaml",
    nodeId: "node-upper"
  });
  assert.deepEqual(updated.frames[0]?.stepUp, reopened.frames[0]?.stepUp);
  assert.deepEqual(afterDelete.frames[0]?.stepUp, reopened.frames[0]?.stepUp);
  assert.deepEqual(afterDelete.frames[0]?.nodeIds, []);
}

const cases = [
  ["createProject bootstraps a project folder with manifest and models directory", testCreateProjectBootstrap],
  ["listProjects and getProject read the manifest back from disk", testListAndReopen],
  ["createProject rejects conflicting folder slugs with a readable error", testConflictHandling],
  ["getProjectTree reflects real folders and YAML files after the project changes", testProjectTreeAndRefresh],
  ["createFreeformModel persists an empty freeform model and updates defaultModel", testCreateFreeformModelAndDefaultModel],
  ["getModel reopens persisted freeform models and secondary placement stays stable", testOpenModelAndSecondaryPlacement],
  ["create/update/delete node operations persist freeform node state", testNodeLifecycleAndPersistence],
  ["deleteNode cleans dangling edge and frame references", testDeleteNodeCleansDanglingReferences],
  ["create/delete edge operations persist source and target ids", testEdgeLifecycleAndPersistence],
  ["createEdge rejects references to missing nodes", testCreateEdgeRejectsMissingNodes],
  ["create/update/delete frame operations persist metadata and membership", testFrameLifecycleAndPersistence],
  ["deleteNode removes node ids from frames without deleting the frame", testDeleteNodeCleansFrameMembershipOnly],
  ["existing frame stepUp links survive frame edits and membership cleanup", testFrameStepUpLinkPersistsAcrossMembershipEdits]
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
