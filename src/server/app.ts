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
