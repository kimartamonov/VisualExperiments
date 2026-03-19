# M3-07 Technical Documentation

## Purpose

`M3-07` is the milestone-level validation gate for hierarchy and semantic navigation. Its role is to verify that the previously implemented drill-down, step-up, breadcrumbs, back navigation, and multi-drilldown contracts behave as one reversible cross-model workflow.

## Validation Approach

- Added `test/hierarchy-validation.mjs` as a dedicated integrated acceptance scenario.
- Added `npm.cmd run validate:m3` to make the milestone gate reproducible.
- Kept existing lower-level validation scripts in place and reran them as regression support:
  - `validate:m3:drilldown`
  - `validate:m3:multidrilldown`
  - `validate:m3:navigation`
  - `validate:m3:stepup`
  - `validate:m3:spike`

## Scenario Covered

The integrated validation script checks:

- source-model creation and freeform baseline
- frame step-up into an upper-level model
- breadcrumb/back return from that upper level
- repeated default step-up reuse
- two linked drill-down targets on one node
- open and return for both drill-down models
- missing drill-down target recovery path
- restart/reopen persistence for both `frame.stepUp` and `Node.drilldowns[]`

## Stable Contracts Confirmed

- navigation stays runtime-only and reversible
- `frame.stepUp` remains the canonical persisted upper-level link
- `Node.drilldowns[]` remains the canonical persisted multi-link child-model list
- missing linked targets return recoverable `404` behavior instead of crash semantics

## Limitations

- This issue validates behavior but intentionally does not fix defects.
- UX polish findings below blocker severity remain outside the scope of this pass.
- Full save/recovery hardening still belongs to M5.

## Integration Point For Next Issue

- `M3-08` can now focus only on blockers because the hierarchy milestone has a reproducible gate and currently reports no critical/high findings.
- Future milestones can treat `validate:m3` as the authoritative hierarchy acceptance baseline.
