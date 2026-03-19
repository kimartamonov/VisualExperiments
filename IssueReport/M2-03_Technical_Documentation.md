# M2-03 Technical Documentation

## Purpose

This issue turns the freeform canvas from a set of isolated nodes into a minimal directed graph editor with persisted edges.

## Architectural Approach

- Edge persistence stays inside `ProjectService`, so create/delete operations reuse the same project-root and model-path safety checks as nodes.
- The backend exposes explicit edge operations instead of generic model mutation:
  - `POST /api/projects/:projectId/edges`
  - `DELETE /api/projects/:projectId/edges/:edgeId?path=...`
- The client renders edges as an SVG overlay inside the same canvas stage used by node cards.
- Edge creation uses a lightweight interaction model:
  - choose a source node;
  - enter outgoing-edge mode;
  - click a target node.

## Contracts And Data Structures

### Edge contract

- `id: string`
- `source: string`
- `target: string`

### Model document impact

- `edges` is now validated as an array of stable directed references.
- Source and target must point to existing node ids at creation time.
- Node deletion removes any edge whose `source` or `target` references the deleted node.

### Frontend state

- `selectedEdgeId`: current edge selection for inspect/delete flows.
- `edgeCreationSourceId`: transient source node for the next edge creation.
- `mutatingEdgeId`: transient request state for create/delete operations.

## Key Logic

- The canvas SVG layer computes line endpoints from persisted node positions.
- Arrowheads make direction explicit without introducing labels or advanced routing.
- Edge selection can come from either the line on canvas or the edge list in the properties panel.
- Deleting a selected edge only mutates the `edges` collection and leaves node state intact.

## Limitations

- Routing is straight-line only.
- Self-loop and duplicate-edge behavior are not specially optimized in the UI.
- There is no edge label, styling, or typed semantics in this MVP slice.

## Integration Points

- `M2-04` can group existing node ids into frames while relying on already-stable graph entities.
- `M2-05` can validate a fuller freeform workflow with node and edge persistence together.
- `M5-01` later reuses the same YAML graph contracts for round-trip integrity checks.

## Stable Base For Next Issue

The next issue can rely on:

- stable directed edge ids and node references;
- canvas rendering of node-plus-edge graphs;
- cleanup of edges during node deletion;
- persisted graph restoration after reopen.
