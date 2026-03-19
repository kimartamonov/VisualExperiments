# M4-01 Technical Documentation

## Purpose

`M4-01` adds the first stable semantic layer on top of freeform modeling. Nodes can now carry a late-assigned type and matching color cue without converting the model into a different editor mode.

## Architecture

- A shared catalog lives in `src/shared/node-typing.ts` and defines the MVP type/color pairs.
- The backend validates and persists node typing in `src/server/project-service.ts`.
- The client consumes the same catalog for node property editing and canvas rendering in `src/client/App.tsx`.
- Styling in `src/client/styles.css` maps persisted color tokens to visible node-card accents and preview surfaces.

## Data Contract

- `ModelNode` now supports optional `typing`.
- `typing` is persisted as:
  - `typeId`
  - `colorToken`
- Absence of `typing` means the node is still freeform/untyped.
- Removing a type deletes the semantic cue without touching other node data such as `position`, `drilldowns`, edges, or frame membership.

## Key Logic

- `updateNode()` accepts `typing` in addition to the existing node patch fields.
- Backend validation canonicalizes the catalog entry and rejects unknown or mismatched type/color pairs.
- Legacy models without `typing` remain valid and reopen without migration steps.
- The client keeps type editing inside the existing node properties form, so label/description/type can be saved as one node patch.
- Canvas cards render a badge plus left-border/background cue derived from the persisted color token.

## Integration Points

- `M4-02` can read unique `typeId`/`colorToken` pairs directly from typed nodes.
- Existing M2/M3 contracts continue to work because node typing is additive and optional.
- Validation coverage now includes:
  - service-level typing persistence and clearing
  - full-stack late typing acceptance via `validate:m4:typing`

## Limitations

- Catalog membership is fixed in code for MVP.
- There is no user-defined type editor yet.
- Type semantics do not yet affect edges, frames, or notation authoring beyond being persisted on nodes.

## What The Next Issue Can Rely On

- A stable late-typing catalog exists in shared code.
- Typed nodes survive save/reopen/restart.
- Typed nodes remain embedded in ordinary freeform models without breaking navigation or graph structure.
