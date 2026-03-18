import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const clientDir = path.join(distDir, "client");
const serverDir = path.join(distDir, "server");

await rm(distDir, { recursive: true, force: true });
await mkdir(path.join(clientDir, "assets"), { recursive: true });
await mkdir(serverDir, { recursive: true });

await cp(path.join(rootDir, "public"), clientDir, { recursive: true });

await build({
  entryPoints: [path.join(rootDir, "src", "client", "main.tsx")],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  minify: false,
  outdir: path.join(clientDir, "assets"),
  entryNames: "app",
  sourcemap: true,
  target: "es2022"
});

await build({
  entryPoints: [
    path.join(rootDir, "src", "server", "app.ts"),
    path.join(rootDir, "src", "server", "index.ts"),
    path.join(rootDir, "src", "server", "project-service.ts")
  ],
  bundle: true,
  format: "esm",
  outdir: serverDir,
  packages: "external",
  platform: "node",
  sourcemap: true,
  target: "node22"
});
