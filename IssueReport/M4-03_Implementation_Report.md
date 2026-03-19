# M4-03 Implementation Report

## Implemented Issue

- Issue ID: `M4-03`
- Title: `Create typed models from notation`
- Milestone: `M4. Typing and Notation Workflow`

## What Was Done

- Added project-level notation registry reading so the client and backend can work from persisted notation artifacts instead of in-memory assumptions.
- Implemented typed model creation from an existing notation, reusing the same model file format and placement rules while persisting `model.notation` as the selected notation id.
- Extended node creation so typed models can create nodes with notation-backed type/color pairs during the create-node flow.
- Updated the workspace UI to create either freeform or typed models from one form and to show a minimal type picker in the canvas toolbar when the current model is typed.
- Preserved existing editor infrastructure for open, navigation, edges, frames, and reopen while adding the typed-model branch.
- Added service-level regression coverage and a dedicated acceptance validation for AC-11 and demo steps 12-13.

## Files Changed

- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `test/project-service.test.mjs`
- `test/typed-model-validation.mjs`
- `package.json`

## Acceptance Covered

- User can create a new model by choosing an existing notation.
- Notation types are available in the create-node flow for typed models.
- Newly created nodes in typed models immediately receive the chosen type/color pair.
- Typed models persist and reopen with the correct notation reference and typed-node YAML round-trip.

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
- `npm.cmd run validate:m4:notation`
- `npm.cmd run validate:m4:typedmodel`

## Out Of Scope

- No strict conformance engine for notation rules was added.
- No default node templates per notation were introduced.
- No typed-edge semantics or richer meta-model behavior were added.

## Remaining Risks

- Typed models now exist as persisted artifacts, but the whole M4 semantic loop still needs the dedicated milestone validation gate in `M4-04`.
- Missing or hand-edited notation files are not yet part of the hardened recovery scope; that remains for later stability issues.

## Unblocked Next Work

- `M4-04` can now validate the full semantic bridge `freeform -> typing -> notation -> typed model`.
- `M5-01` can later include typed-model and notation references in project round-trip persistence checks.
