import express from "express";
import path from "node:path";

import { ConflictError, NotFoundError, ValidationError } from "./errors.js";
import { ProjectService } from "./project-service.js";

export interface AppOptions {
  projectRoot: string;
  clientRoot: string;
}

export function createApp({ projectRoot, clientRoot }: AppOptions) {
  const app = express();
  const projectService = new ProjectService(projectRoot);

  app.use(express.json());
  app.use(express.static(clientRoot));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/projects", async (_request, response, next) => {
    try {
      response.json({ projects: await projectService.listProjects() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", async (request, response, next) => {
    try {
      const name = typeof request.body?.name === "string" ? request.body.name : "";
      const project = await projectService.createProject(name);
      response.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:projectId", async (request, response, next) => {
    try {
      const project = await projectService.getProject(request.params.projectId);
      response.json({ project });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:projectId/tree", async (request, response, next) => {
    try {
      const tree = await projectService.getProjectTree(request.params.projectId);
      response.json({ tree });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects/:projectId/models", async (request, response, next) => {
    try {
      const name = typeof request.body?.name === "string" ? request.body.name : "";
      const selectedPath = typeof request.body?.selectedPath === "string" ? request.body.selectedPath : null;
      const model = await projectService.createFreeformModel(request.params.projectId, name, selectedPath);
      response.status(201).json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:projectId/models", async (request, response, next) => {
    try {
      const requestedPath = typeof request.query.path === "string" ? request.query.path : "";
      const model = await projectService.getModel(request.params.projectId, requestedPath);
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects/:projectId/nodes", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const label = typeof request.body?.label === "string" ? request.body.label : undefined;
      const position = request.body?.position;
      const result = await projectService.createNode(request.params.projectId, modelPath, { label, position });
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/projects/:projectId/nodes/:nodeId", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const patch = {
        label: typeof request.body?.label === "string" ? request.body.label : undefined,
        description: typeof request.body?.description === "string" ? request.body.description : undefined,
        position: request.body?.position,
        drilldowns: request.body?.drilldowns
      };
      const model = await projectService.updateNode(request.params.projectId, modelPath, request.params.nodeId, patch);
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/projects/:projectId/nodes/:nodeId", async (request, response, next) => {
    try {
      const modelPath = typeof request.query.path === "string" ? request.query.path : "";
      const model = await projectService.deleteNode(request.params.projectId, modelPath, request.params.nodeId);
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects/:projectId/edges", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const source = typeof request.body?.source === "string" ? request.body.source : "";
      const target = typeof request.body?.target === "string" ? request.body.target : "";
      const result = await projectService.createEdge(request.params.projectId, modelPath, { source, target });
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/projects/:projectId/edges/:edgeId", async (request, response, next) => {
    try {
      const modelPath = typeof request.query.path === "string" ? request.query.path : "";
      const model = await projectService.deleteEdge(request.params.projectId, modelPath, request.params.edgeId);
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects/:projectId/frames", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const result = await projectService.createFrame(request.params.projectId, modelPath, {
        name: typeof request.body?.name === "string" ? request.body.name : undefined,
        description: typeof request.body?.description === "string" ? request.body.description : undefined,
        nodeIds: request.body?.nodeIds
      });
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/projects/:projectId/frames/:frameId", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const model = await projectService.updateFrame(request.params.projectId, modelPath, request.params.frameId, {
        name: typeof request.body?.name === "string" ? request.body.name : undefined,
        description: typeof request.body?.description === "string" ? request.body.description : undefined,
        nodeIds: request.body?.nodeIds
      });
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/projects/:projectId/frames/:frameId", async (request, response, next) => {
    try {
      const modelPath = typeof request.query.path === "string" ? request.query.path : "";
      const model = await projectService.deleteFrame(request.params.projectId, modelPath, request.params.frameId);
      response.json({ model });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects/:projectId/frames/:frameId/step-up", async (request, response, next) => {
    try {
      const modelPath = typeof request.body?.modelPath === "string" ? request.body.modelPath : "";
      const mode = request.body?.mode === "regenerate" ? "regenerate" : "default";
      const result = await projectService.stepUpFrame(
        request.params.projectId,
        modelPath,
        request.params.frameId,
        mode
      );
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(clientRoot, "index.html"));
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ValidationError || error instanceof ConflictError || error instanceof NotFoundError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error(error);
    response.status(500).json({ error: "Unexpected server error." });
  });

  return app;
}
