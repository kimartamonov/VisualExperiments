# M5-04 Technical Documentation

## Purpose

`M5-04` is the final MVP acceptance gate. Its role is not to add behavior, but to prove that the entire product works as one continuous user journey from project bootstrap through semantic modeling to final save/reopen.

## Validation Architecture

- [test/full-demo-acceptance-validation.mjs](/C:/Users/User/Documents/GitHub/VisualExperiments/test/full-demo-acceptance-validation.mjs) is the final end-to-end acceptance script.
- The script uses the built server through `dist/server/app.js`, matching all prior milestone validation gates.
- Navigation portions of the demo are validated through the shared runtime navigation contract from `dist/server/navigation.js`.
- The acceptance scenario explicitly logs step evidence for all 14 demo steps.

## Scenario Structure

- Steps 1-2
  - create project
  - reopen project and confirm tree shell
- Steps 3-5
  - create freeform model
  - create nodes and edge
  - create frame
- Steps 6-9
  - generate step-up model
  - open upper-level navigation path
  - create/open drill-down
  - navigate back and remove one drill-down link safely
- Steps 10-13
  - assign late typing
  - extract notation
  - create typed model
  - create typed node
- Step 14
  - save project and confirm reopen persistence for the full artifact set

## Contracts Proven Stable

- Project bootstrap, tree rendering, and model lifecycle work as the first user-visible entry path.
- Freeform graph editing, hierarchy navigation, and semantic promotion coexist in one project without flow breakage.
- Typing and notation workflows compose cleanly on top of freeform and hierarchy behavior.
- Manual save/reopen preserves all artifacts needed by the demo scenario.

## Acceptance Outcome

- All 14 steps passed.
- No critical or high blockers were observed.
- The final acceptance baseline is therefore considered stable enough for the formal final bugfix slot.

## Regression Strategy

- `validate:m5:demo` is now the top-level end-to-end acceptance gate.
- It is supported by the milestone gates beneath it:
  - `validate:m1`
  - `validate:m2`
  - `validate:m3`
  - `validate:m4`
  - `validate:m5`
  - `validate:m5:roundtrip`
  - `validate:m5:recovery`

## Limitations

- This issue does not implement fixes; it only validates and records the final MVP path.
- Any future blocker repair remains for `M5-05`.
- The acceptance pass is server/API-driven and uses runtime navigation helpers rather than full browser automation.

## What The Next Issue Can Rely On

- The complete MVP demo path has formal pass evidence.
- There is currently no blocker list coming out of final acceptance.
- `M5-05` can now act as a formal closeout bugfix slot and confirm that no critical/high fixes are required.
