# M4-02 Technical Documentation

## Purpose

`M4-02` turns late typing into a reusable persisted language artifact. A typed freeform model can now emit a notation YAML file, register it in the project manifest, and bind the source model to that notation without rebuilding the diagram.

## Architecture

- Shared node type metadata in `src/shared/node-typing.ts` now includes the hex colors needed for notation serialization.
- `src/server/project-service.ts` owns the extraction workflow:
  - load current model for mutation
  - collect unique typed-node definitions
  - create a stable `notations/*.yaml` path
  - update `project.yaml`
  - persist the source model with the new notation binding
- `src/server/app.ts` exposes the flow as `POST /api/projects/:projectId/notations`.
- `src/client/api.ts` defines the notation creation payload and response contract.
- `src/client/App.tsx` adds a model-level action in the existing workspace shell so extraction happens from the currently opened model context.

## Data Contract

- `ProjectManifest.notations?: string[]` remains the source of truth for registered notation files.
- Notation YAML v1 is persisted as:
  - `id`
  - `name`
  - `types[]`
- Each notation type entry contains:
  - `id`
  - `name`
  - `color`
- `ModelDocument.notation` now moves from `"freeform"` to the created notation id after extraction.

## Key Logic

- Extraction reads typed nodes only and deduplicates by `typeId`.
- The persisted notation artifact is intentionally narrow: no edges, frames, positions, drill-downs, or step-up data are copied into notation YAML.
- The notation file path is created under `notations/` with slug-based conflict avoidance.
- Manifest updates are merged without duplicating previously registered notation paths.
- The client disables notation creation when the current model has no typed nodes.

## Integration Points

- `M4-01` late typing provides the stable source data for extraction.
- `M4-03` can now rely on a persisted notation registry and `model.notation` binding behavior.
- Existing freeform, navigation, drill-down, and step-up flows remain unchanged because notation extraction is additive and does not rewrite graph structure.
- Validation coverage now includes:
  - service-level notation extraction tests in `test/project-service.test.mjs`
  - end-to-end acceptance in `test/notation-extraction-validation.mjs`

## Limitations

- There is still no notation browser or notation editor UI.
- Extraction uses the shared MVP catalog and does not support user-defined types yet.
- The client currently reports the latest created notation id/path, but does not yet expose full notation artifact browsing or editing.

## What The Next Issue Can Rely On

- A typed model can generate a persisted notation artifact under `notations/`.
- `project.yaml` registers notation paths in a stable manifest contract.
- Source models survive extraction with their original graph state intact.
- `model.notation` now acts as a stable bridge from freeform modeling into typed-model creation.
