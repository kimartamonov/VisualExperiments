# M2-02 Implementation Report

## Implemented Issue

- Issue ID: `M2-02`
- Title: `Create and persist nodes in freeform models`
- Completed on: `2026-03-18`

## What Was Done

- Added a stable node contract to the freeform model schema with `id`, `label`, `description`, and `position`.
- Implemented backend node lifecycle operations for create, update, move, and delete with YAML persistence.
- Added cleanup on node deletion so known edge references are removed and frame `nodeIds` stop pointing at deleted nodes.
- Extended the workspace API with dedicated node endpoints used by the canvas UI.
- Replaced the empty center-panel placeholder with a minimal freeform node canvas.
- Added node creation from the canvas UI, drag-and-drop movement, predictable node selection, and editing through the properties panel.
- Persisted node label, description, and position so they survive reopen.
- Added service-level and HTTP-level validation for repeated create/edit/delete cycles and reopen integrity.

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

- Nodes can be created from the canvas UI.
- Nodes can be moved and their positions persist after reopen.
- Node `label` and `description` can be edited through the properties panel.
- Node deletion does not leave dangling references in already-relevant model collections.
- Repeated create/edit/delete cycles complete without crashes in the verified flows.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd run validate:m2`

## Out of Scope

- Directed edge creation and deletion UX.
- Frame creation and membership editing UX.
- Typed node picker and styling variants.
- Drill-down, step-up, and semantic typing behavior.

## Remaining Risks

- Canvas behavior is intentionally minimal and not yet optimized for large graphs.
- Deletion cleanup only targets the reference shapes already relevant before `M2-03` and `M2-04`.
- Browser-level end-to-end automation is still absent; validation is covered through service and HTTP integration checks.

## What Is Now Unblocked

- `M2-03` can build directed edges on top of stable persisted node ids and positions.
- `M2-04` can attach frame membership to existing node ids without redefining node persistence.
- `M4-01` later receives a stable place to extend node properties for late typing.
