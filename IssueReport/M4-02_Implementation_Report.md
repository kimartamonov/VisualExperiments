# M4-02 Implementation Report

## Implemented Issue

- Issue ID: `M4-02`
- Title: `Create and register notation from current model`
- Milestone: `M4. Typing and Notation Workflow`

## What Was Done

- Added backend notation extraction from the current model, including unique type/color collection from typed nodes only.
- Added notation artifact creation under `notations/`, project manifest registration through `project.yaml`, and source-model binding through `model.notation`.
- Exposed the notation creation flow through a dedicated API endpoint and client API contract.
- Added workspace UI action and model-level status cards so notation can be created from the currently opened typed model without recreating the source diagram.
- Preserved existing nodes, edges, frames, layout, and typing data after notation creation.
- Added regression coverage in the project service tests and a dedicated end-to-end validation for AC-10 and demo step 11.

## Files Changed

- `src/shared/node-typing.ts`
- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `test/notation-extraction-validation.mjs`
- `package.json`

## Acceptance Covered

- A typed freeform model can produce a notation artifact.
- Extraction keeps only unique type/color pairs and excludes edges, frames, and layout data from the notation YAML.
- A notation YAML file is created under `notations/`.
- `project.yaml` is updated with the notation path.
- The current model is rebound from `freeform` to the created notation and remains openable without data loss.

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

## Out Of Scope

- No notation editor was added.
- No deep cleanup or normalization of type names was introduced.
- No richer notation semantics beyond the MVP type/color catalog were added.

## Remaining Risks

- Notation artifacts are created reliably, but typed model creation still needs `M4-03` to prove the end-to-end reusable-language loop.
- The notation schema remains intentionally minimal until later persistence and validation gates exercise it with typed-model round trips.

## Unblocked Next Work

- `M4-03` can now create typed models from a real persisted notation artifact instead of an in-memory assumption.
- `M4-04` can validate step 11 on top of a stable extraction and binding flow.
- `M5-01` now has the notation artifact path needed for later round-trip persistence checks.
