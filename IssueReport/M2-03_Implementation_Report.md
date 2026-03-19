# M2-03 Implementation Report

## Implemented Issue

- Issue ID: `M2-03`
- Title: `Create and delete directed edges`
- Completed on: `2026-03-18`

## What Was Done

- Added a stable edge contract to freeform models with `id`, `source`, and `target`.
- Implemented backend edge creation and deletion with validation that source and target nodes already exist.
- Preserved edge persistence in YAML and synchronized edge cleanup with the existing node deletion flow.
- Extended the HTTP API with dedicated edge endpoints for create and delete operations.
- Added canvas rendering for directed edges through SVG lines with explicit arrowheads.
- Added a minimal edge creation UX: select a source node, enter outgoing-edge mode, and click a target node.
- Added edge selection and deletion from both the canvas and the properties panel.
- Extended service and HTTP validation to cover edge create/delete/reopen scenarios without regressing node editing.

## Files Changed

- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `test/freeform-bootstrap-validation.mjs`
- `IssueReleaseJournal.md`

## Acceptance Criteria Covered

- Directed edges can be created between two existing nodes.
- Direction is visually distinguishable on the canvas through arrowheads.
- Edges can be deleted without damaging the model.
- Edge lists restore correctly after reopen.
- Deleting a node leaves no dangling edge references.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd run validate:m2`

## Out of Scope

- Edge labels.
- Typed edges and semantic edge validation.
- Advanced routing, handles, or styling variants.
- Frame creation and membership editing.

## Remaining Risks

- Edge routing is intentionally straight-line and may overlap nodes in dense layouts.
- Duplicate edges are not specially visualized or normalized.
- Validation remains service- and HTTP-based rather than full browser automation.

## What Is Now Unblocked

- `M2-04` can build frames on top of a stable node-plus-edge graph.
- `M2-05` can validate the broader freeform editing flow with nodes and edges together.
