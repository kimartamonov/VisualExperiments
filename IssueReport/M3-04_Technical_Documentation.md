# M3-04 Technical Documentation

## Purpose

`M3-04` implements the first end-to-end drill-down path for the hierarchy milestone: a node can persist links to child models, open them, and return through the shared runtime navigation context.

## Architectural Approach

- Persist drill-down links inside the node data itself as root-relative model paths.
- Reuse the existing freeform-model creation/open flow instead of inventing a separate child-model storage format.
- Keep navigation concerns delegated to the `M3-03` runtime navigation contract.
- Keep the UI minimal for MVP while making the data model ready for future multiple-drilldown support.

## Contracts And Data Structures

### `ModelNode.drilldowns`

- Type: `string[]`
- Meaning: root-relative model paths linked from this node to child models
- Rules:
  - values must be valid model paths
  - duplicates are removed
  - links cannot point to the current model itself
  - missing paths are allowed to remain persisted so recovery after reopen is possible

### Backward Compatibility

- Older YAML files without `drilldowns` still reopen correctly.
- During model read, missing `drilldowns` values are normalized to `[]`.

## Backend Changes

### `src/server/project-service.ts`

- `ModelNode` now includes `drilldowns`.
- `createNode()` initializes new nodes with `drilldowns: []`.
- `updateNode()` now accepts and persists `drilldowns`.
- `readModel()` normalizes legacy node records so old models remain valid.
- Validation ensures drill-down references stay syntactically safe and root-relative.

### `src/server/app.ts`

- Node patch endpoint now accepts `drilldowns` in the request body and forwards it into the existing node update flow.

## Frontend Changes

### `src/client/App.tsx`

- Selected-node properties now expose a drill-down section with three core flows:
  - create child model
  - link existing model
  - open linked model
- Missing linked models surface a recovery card instead of only a generic failure.
- Opening a child model routes through the existing `openModel()` navigation-aware path from `M3-03`, so back/breadcrumb behavior stays consistent.

### `src/client/api.ts`

- Client `ModelNode` type now includes `drilldowns`.
- Node patch API accepts `drilldowns` updates.

### `src/client/styles.css`

- Added lightweight styling for drill-down list items, recovery card, and model-link controls in the node properties panel.

## Validation Strategy

### `test/project-service.test.mjs`

- Verifies `drilldowns` persistence through node updates.
- Verifies legacy nodes reopen with empty drill-down lists.

### `test/drilldown-validation.mjs`

- Covers:
  - create child drill-down model
  - link existing model
  - open child model
  - return via shared navigation stack
  - persistence after reopen
  - broken-path recovery surface via preserved missing link

## Limitations

- The UI does not yet provide a polished multiple-drilldown selector.
- Recovery is intentionally minimal and aimed at keeping the user unblocked.
- The issue does not enforce semantic correctness of what is stored in child models.

## What The Next Issues Can Rely On

- `Node.drilldowns[]` is now a stable persisted contract.
- Single drill-down create/open/return behavior is implemented end-to-end.
- `M3-06` can refine multi-link UX without redefining the storage model.
- `M3-07` can validate demo steps 8-9 over a real implementation instead of a placeholder flow.
