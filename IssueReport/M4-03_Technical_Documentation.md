# M4-03 Technical Documentation

## Purpose

`M4-03` makes notation operational. After `M4-02` created a reusable notation artifact, the application can now create a new typed model from that notation and use notation-defined types directly in the node creation flow.

## Architecture

- `src/server/project-service.ts` now has three connected responsibilities:
  - read notation artifacts registered in `project.yaml`
  - create typed models with `notation` set to a notation id
  - validate typed-node creation against the selected notation
- `src/server/app.ts` extends the existing REST surface with:
  - `GET /api/projects/:projectId/notations`
  - typed-model support on `POST /api/projects/:projectId/models`
  - typed-node support on `POST /api/projects/:projectId/nodes`
- `src/client/api.ts` mirrors those contracts for the React shell.
- `src/client/App.tsx` reuses the existing workspace and canvas structure, adding:
  - notation selection in the model creation form
  - project-notation loading alongside project/tree loading
  - a minimal typed-node picker in the canvas toolbar for typed models

## Data Contract

- `project.yaml` remains the source of truth for notation registration through `notations[]`.
- Typed models use the same `ModelDocument` shape as freeform models and differ only by `notation !== "freeform"`.
- Node creation in typed models sends persisted `typing` at creation time:
  - `typeId`
  - `colorToken`
- The backend validates that the selected type exists in the bound notation and still maps cleanly to the MVP shared catalog.

## Key Logic

- Typed-model creation reuses the existing placement rules from M1/M2, including `models/main.yaml` for the first model when appropriate and slug-based collision handling.
- The server resolves notation ids through the manifest, not direct file paths stored inside models.
- Project notation listing reads registered notation files and returns `NotationDetails[]` for the client.
- Node creation now branches by model mode:
  - freeform models can still create ordinary untyped nodes
  - typed models require a notation-backed type during node creation
- The client keeps the type picker minimal: for typed models, the toolbar exposes notation types and applies the selected type on click or double-click node creation.

## Integration Points

- `M4-02` notation extraction provides the persisted artifacts consumed here.
- Existing M2/M3 editor capabilities are reused unchanged for movement, selection, edges, frames, drill-down, step-up, and navigation.
- Validation coverage now includes:
  - service-level typed-model tests in `test/project-service.test.mjs`
  - end-to-end typed-model acceptance in `test/typed-model-validation.mjs`

## Limitations

- Typed models still rely on the MVP shared catalog behind the notation artifacts.
- The node properties editor is not yet a full notation governance surface; this issue focuses on the create-node path.
- Recovery for broken notation references is not expanded here beyond existing project-loading behavior.

## What The Next Issue Can Rely On

- Persisted notation artifacts can be listed and selected during model creation.
- Typed models round-trip with stable `notation` references.
- Typed-node creation on the canvas now uses notation-backed type/color choices.
- The semantic bridge `freeform -> notation -> typed model` is implemented and ready for milestone validation.
