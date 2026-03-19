# M2-04 Implementation Report

## Implemented Issue

- Issue ID: `M2-04`
- Title: `Create and persist frames as semantic containers`
- Completed on: `2026-03-18`

## What Was Done

- Added a stable frame contract to freeform models with `id`, `name`, `description`, `nodeIds`, and `stepUp: null`.
- Implemented backend frame create, update, and delete operations with YAML persistence.
- Validated frame membership against existing node ids and kept `stepUp` explicitly null for the pre-M3 scope.
- Extended node deletion cleanup so frames lose removed node ids without being deleted themselves.
- Added HTTP API endpoints for frame lifecycle operations.
- Added frame rendering on the canvas as semantic container overlays around member nodes or as empty staged containers.
- Added frame selection, metadata editing, membership management, and safe frame deletion in the properties panel.
- Extended service and HTTP validation to cover frame create/update/delete, membership persistence, reopen, and non-destructive deletion.

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

- Frames can be created and displayed as containers on the canvas.
- Frames have editable `name` and `description`.
- Nodes can be added to and removed from frame membership.
- Frames persist as entities with membership on stable node ids.
- Deleting a frame leaves nodes on the canvas and keeps the model valid.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd run validate:m2`

## Out of Scope

- Step-up synchronization semantics.
- Typed frame semantics.
- Live synchronization with upper-level models.
- Frame dragging/resizing or advanced visual polish.

## Remaining Risks

- Frame layout is derived from membership and simple empty-frame placement, not from a dedicated persisted geometry model.
- Dense graphs can still create visual overlap between edges, nodes, and frames.
- Validation remains service- and HTTP-based rather than full browser automation.

## What Is Now Unblocked

- `M2-05` can validate the complete freeform workflow with nodes, edges, and frames together.
- `M3-01` and `M3-05` can use frame entities as the stable entry point for later step-up logic.
