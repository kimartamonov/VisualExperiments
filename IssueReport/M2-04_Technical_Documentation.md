# M2-04 Technical Documentation

## Purpose

This issue introduces frames as persisted semantic containers over stable node ids, completing the MVP freeform graph foundation before the navigation milestone.

## Architectural Approach

- Frame persistence stays inside `ProjectService`, so membership updates reuse the same model-path validation and YAML write flow as nodes and edges.
- The backend exposes explicit frame lifecycle endpoints:
  - `POST /api/projects/:projectId/frames`
  - `PATCH /api/projects/:projectId/frames/:frameId`
  - `DELETE /api/projects/:projectId/frames/:frameId?path=...`
- The client treats frames as first-class selectable entities alongside nodes and edges.
- Canvas rendering derives frame bounds from member node positions when membership exists, and falls back to deterministic empty-frame placement when it does not.

## Contracts And Data Structures

### Frame contract

- `id: string`
- `name: string`
- `description: string`
- `nodeIds: string[]`
- `stepUp: null`

### Model document impact

- `frames` is now validated as a typed collection rather than an open record array.
- Membership is stored only through stable node ids, never through coordinates alone.
- Node deletion trims `nodeIds` inside frames but does not delete the frame entity.

### Frontend state

- `selectedFrameId`: current frame selection.
- `frameNameDraft` / `frameDescriptionDraft`: editable metadata buffer.
- `frameNodeIdsDraft`: staged membership selection before save.
- `mutatingFrameId`: transient request state for create/update/delete actions.

## Key Logic

- Frame creation produces a semantic entity immediately, even before any nodes are assigned.
- Saving a frame writes metadata plus membership in a single update operation.
- Membership checkboxes are driven by current node ids, so the UI always reflects valid frame candidates.
- Canvas frame bounds are computed from the currently referenced nodes, which keeps the visual container aligned with semantic membership after node movement.

## Limitations

- Empty frame placement is deterministic but not user-positionable yet.
- Frame geometry is not independently persisted.
- `stepUp` intentionally remains `null` until M3 defines the semantics.

## Integration Points

- `M2-05` can validate the end-to-end freeform editor with frame persistence included.
- `M3-01` can define step-up semantics on top of an already-stable frame entity.
- `M3-05` can later implement step-up behavior using the same `stepUp` slot without reworking frame membership storage.

## Stable Base For Next Issue

The next issue can rely on:

- frame entities as persisted semantic containers;
- stable membership by node id;
- non-destructive frame deletion behavior;
- round-trip restore of frame metadata and membership after reopen.
