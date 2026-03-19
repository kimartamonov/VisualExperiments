# M5-01 Implementation Report

## Implemented Issue

- Issue ID: `M5-01`
- Title: `Implement manual save and round-trip reload integrity`
- Milestone: `M5. Stability and Demo Readiness`

## What Was Done

- Added an explicit manual `Save project` contract on the backend and frontend so the user can trigger a project-level checkpoint instead of relying only on per-entity mutation persistence.
- Implemented project-wide canonical save in the service layer:
  - re-reads all model YAML files under `models/`
  - re-reads all registered notation YAML files from `project.yaml`
  - rewrites manifest, models, and notation artifacts in canonical schema form
  - strips transient keys that do not belong to the persisted contract
- Added workspace save UI with visible checkpoint status and last-save summary so the manual save path is discoverable and explicit in the shell.
- Extended service regression coverage with a saveProject test that proves round-trip integrity and transient-state stripping.
- Added an end-to-end M5 validation pass that exercises explicit save, repeated save/reopen cycles, and full P0 artifact survival across restart.

## Files Changed

- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `test/manual-save-roundtrip-validation.mjs`
- `package.json`

## Acceptance Covered

- User can explicitly save the project through a dedicated action.
- After reopen, models, nodes, edges, frames, drill-down links, step-up links, typing, notation references, and typed models remain available.
- Project structure and relative links survive repeated save/reopen cycles.
- Runtime-only state such as breadcrumb or selection artifacts is stripped from persisted YAML during canonical save.

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
- `npm.cmd run validate:m4`
- `npm.cmd run validate:m5:roundtrip`

## Out Of Scope

- Autosave is still not the required MVP path.
- Conflict resolution and version history were not introduced.
- File-corruption recovery remains for `M5-02` and later validation issues.

## Remaining Risks

- Invalid YAML and missing-asset unhappy paths are not fully hardened in this issue; they move to `M5-02`.
- Manual save now guarantees canonical round-trip behavior, but recovery messaging still needs dedicated fallback UX.

## Unblocked Next Work

- `M5-02` can now focus on invalid YAML, missing model, and missing notation recovery paths over a stable save/reopen baseline.
- `M5-03` and `M5-04` can validate persistence and demo acceptance against an explicit project-save contract.
