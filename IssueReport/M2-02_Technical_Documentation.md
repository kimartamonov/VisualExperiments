# M2-02 Technical Documentation

## Purpose

This issue turns the freeform model from an empty artifact into a working node-based canvas with persisted graph primitives.

## Architectural Approach

- Node persistence stays inside `ProjectService`, so model mutation keeps using the same project-root and YAML path guards introduced earlier.
- The server exposes node-focused REST operations instead of a generic raw-file write path:
  - `POST /api/projects/:projectId/nodes`
  - `PATCH /api/projects/:projectId/nodes/:nodeId`
  - `DELETE /api/projects/:projectId/nodes/:nodeId?path=...`
- The client keeps a loaded `currentModel` in memory and applies optimistic movement updates during drag, then persists the final position on pointer release.
- Property edits and deletion go through explicit actions from the right panel rather than hidden autosave loops.

## Contracts And Data Structures

### Freeform node contract

- `id: string`
- `label: string`
- `description: string`
- `position: { x: number; y: number }`

### Model document impact

- `nodes` is now validated as an array of stable node objects.
- `edges` and `frames` remain extensible collections for later issues.
- Node deletion already removes known edge references and trims frame `nodeIds` to avoid dangling state.

### Frontend state

- `currentModel`: open model document, including persisted nodes.
- `selectedNodeId`: current node selection for predictable editing.
- `nodeLabelDraft` / `nodeDescriptionDraft`: right-panel edit buffer.
- `dragStateRef`: transient pointer drag state that is never serialized.

## Key Logic

- Double-clicking the canvas creates a node at the pointer position.
- The add button creates a node at the next default grid slot.
- Dragging updates node position locally first, then persists the final coordinates once the drag ends.
- Saving properties writes only `label` and `description` changes for the selected node.
- Deleting a node updates the model YAML and removes now-invalid references from already-known collections.

## Limitations

- No multi-select, resize, styling, or edge handles yet.
- Dragging is intentionally simple and only supports the single-node happy path.
- Persistence is action-driven; there is still no broader save/recovery workflow from later milestones.

## Integration Points

- `M2-03` can reuse stable node ids to define directed edges.
- `M2-04` can build frame membership on top of persisted node positions and ids.
- `M5-01` can later verify round-trip integrity for node state using the same YAML model documents.

## Stable Base For Next Issue

The next issue can rely on:

- stable persisted node ids;
- persisted node coordinates and text properties;
- predictable node selection in the workspace UI;
- server-side model mutation endpoints that already preserve YAML integrity.
