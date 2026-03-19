# M4-01 Implementation Report

## Implemented Issue

- Issue ID: `M4-01`
- Title: `Implement late typing in freeform models`
- Milestone: `M4. Typing and Notation Workflow`

## What Was Done

- Added a minimal late-typing contract for freeform nodes with persisted `typeId` and `colorToken`.
- Extended backend node mutation flow so typing can be assigned, changed, removed, validated, and restored after reopen.
- Added node typing controls to the right properties panel and color-based visual distinction on canvas cards.
- Preserved compatibility with existing untyped models and existing graph semantics such as positions, edges, frames, and drill-down links.
- Added dedicated M4 validation and service-level regression coverage for assign/change/remove typing behavior.

## Files Changed

- `src/shared/node-typing.ts`
- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `test/late-typing-validation.mjs`
- `package.json`

## Acceptance Covered

- User can assign a type to any node in a freeform model.
- Node cards change visually on the canvas through persisted color cues.
- User can change node type and remove it to return the node to freeform state.
- Typing does not break existing positions, edges, frames, or drill-down links.
- Assigned typing survives reopen and remains usable for later notation extraction.

## Verification Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd run validate:m1`
- `npm.cmd run validate:m2`
- `npm.cmd run validate:m3`
- `npm.cmd run validate:m3:drilldown`
- `npm.cmd run validate:m3:multidrilldown`
- `npm.cmd run validate:m3:navigation`
- `npm.cmd run validate:m3:spike`
- `npm.cmd run validate:m3:stepup`
- `npm.cmd run validate:m4:typing`

## Out Of Scope

- No typed-edge support was added.
- No notation extraction or notation editing UI was added.
- No formal type-rule validation beyond the MVP catalog was introduced.

## Remaining Risks

- Type catalog remains intentionally fixed and minimal until notation extraction formalizes the next artifact.
- Visual distinction is clear for MVP, but richer legend or palette management is deferred to later work.

## Unblocked Next Work

- `M4-02` can now extract notation from typed freeform models using a stable persisted type/color contract.
- `M4-04` can validate Step 10 on top of the new typing flow.
