# M5-01 Technical Documentation

## Purpose

`M5-01` establishes the MVP save contract as an explicit user action. The system already persisted many mutations directly, but this issue adds a reliable project-level checkpoint that rewrites all persisted artifacts in canonical YAML form and proves that the whole project survives repeated round-trip reopen cycles.

## Architecture

- `src/server/project-service.ts` now exposes `saveProject(projectId)`.
- `saveProject` walks the persisted project artifacts through two scopes:
  - all model YAML files under `models/`
  - all existing notation YAML files registered in `project.yaml`
- Each artifact is reloaded through the same parsing or normalization path used for ordinary reopen operations and then written back through the canonical serializer.
- `src/server/app.ts` exposes this through `POST /api/projects/:projectId/save`.
- `src/client/api.ts` mirrors the new save endpoint.
- `src/client/App.tsx` adds a dedicated `Save project` action and checkpoint-status surface inside the workspace toolbar.

## Data Contract

- Persisted artifacts remain YAML source-of-truth:
  - `project.yaml`
  - model YAML files under `models/`
  - notation YAML files referenced from `project.yaml`
- Save canonicalization now explicitly enforces the persisted-vs-transient boundary:
  - persisted fields remain
  - unknown runtime-only fields are dropped on save
- This is achieved by normalizing:
  - `ProjectManifest`
  - `ModelDocument`
  - `ModelNode`
  - `NotationDocument`

## Key Logic

- Manual save is project-level rather than model-level, which lets one explicit checkpoint cover:
  - freeform models
  - typed models
  - drill-down and step-up links
  - notation registry and notation files
- Model canonicalization now reconstructs exact persisted shapes instead of spreading parsed YAML objects, which prevents accidental retention of transient keys.
- Notation and manifest canonicalization apply the same principle so ad hoc UI-only keys do not leak into saved artifacts.
- The frontend tracks whether a new checkpoint is recommended after mutating operations and surfaces the result of the last explicit save.

## Validation Coverage

- `test/project-service.test.mjs` now includes a regression that injects transient keys into manifest/model/notation YAML and proves `saveProject` strips them while preserving round-trip reopen behavior.
- `test/manual-save-roundtrip-validation.mjs` proves:
  - explicit save works through the HTTP surface
  - repeated save/reopen cycles remain stable
  - all P0 artifacts survive restart
  - transient YAML noise is removed by canonical save

## Limitations

- Save does not yet provide advanced repair behavior for invalid YAML or missing files.
- Missing notation and missing linked-model fallback UX remains outside this issue.
- Autosave and conflict handling remain intentionally out of scope.

## What The Next Issue Can Rely On

- A user-visible manual save action now exists in the workspace.
- Save/reopen round-trip is stable across the full P0 artifact set.
- Persisted YAML now has a stronger canonical boundary against transient UI state.
- `M5-02` can build recovery and fallback behavior on top of this stable save contract.
