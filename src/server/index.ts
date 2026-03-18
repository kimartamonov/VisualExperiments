import path from "node:path";

import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const projectRoot = process.env.VE_PROJECTS_DIR
  ? path.resolve(process.env.VE_PROJECTS_DIR)
  : path.resolve(process.cwd(), "runtime", "projects");
const clientRoot = path.resolve(process.cwd(), "dist", "client");
const app = createApp({ projectRoot, clientRoot });

app.listen(port, () => {
  console.log(`VisualExperiments server listening on http://localhost:${port}`);
  console.log(`Project storage root: ${projectRoot}`);
});
