# M5-03 Technical Documentation

## Purpose

`M5-03` formalizes the milestone gate between recovery hardening and the final demo pass. Instead of trusting `M5-01` and `M5-02` separately, it proves that persistence integrity and unhappy-path recovery work together in one connected M5 scenario.

## Validation Architecture

- [test/persistence-recovery-validation.mjs](/C:/Users/User/Documents/GitHub/VisualExperiments/test/persistence-recovery-validation.mjs) is the integrated M5 gate.
- The script runs against the built server through `dist/server/app.js`, matching the established validation style from earlier milestone gates.
- The scenario is intentionally multi-phase:
  - phase 1: create a full project with freeform, drill-down, step-up, notation, and typed-model artifacts, then save
  - phase 2: restart and confirm clean reopen plus repeated save
  - phase 3: introduce external file failures and confirm workspace continuity plus recovery paths
  - phase 4: restart again and confirm recovered state persists
- [package.json](/C:/Users/User/Documents/GitHub/VisualExperiments/package.json) now exposes this gate as `validate:m5`.

## Coverage

- `AC-12`
  - validated by explicit save and repeated reopen cycles
  - validated across source model, child model, generated upper model, notation artifact, and typed model
- `AC-13`
  - validated by intentionally broken model YAML
  - validated by missing drill-down and step-up targets
  - validated by missing notation with typed-model fallback to freeform behavior

## Contracts Proven Stable

- Manual save preserves the full P0 artifact set across restart.
- Broken model files fail locally with readable validation errors instead of collapsing the project.
- Missing linked models remain recoverable through explicit next actions, including step-up regenerate.
- Missing notation artifacts no longer prevent typed models from reopening or continuing in fallback mode where allowed.
- Recovery and persistence can coexist in the same project without hidden corruption of surviving artifacts.

## Regression Strategy

- `validate:m5` is the new milestone gate for the combined persistence/recovery baseline.
- Broader regression coverage remains enforced by rerunning:
  - `test`
  - `validate:m1`
  - `validate:m2`
  - `validate:m3`
  - `validate:m3:drilldown`
  - `validate:m3:multidrilldown`
  - `validate:m3:navigation`
  - `validate:m3:spike`
  - `validate:m3:stepup`
  - `validate:m4:typing`
  - `validate:m4:notation`
  - `validate:m4:typedmodel`
  - `validate:m4`
  - `validate:m5:roundtrip`
  - `validate:m5:recovery`

## Limitations

- This issue validates and documents the milestone baseline; it does not add new save or recovery behavior.
- The final end-to-end 14-step acceptance is intentionally deferred to `M5-04`.
- Guided repair tooling and conflict resolution remain out of scope.

## What The Next Issue Can Rely On

- `validate:m5` is now the single integrated gate for persistence plus recovery.
- The M5 baseline has passed repeated save/reopen and mixed valid/invalid artifact scenarios without blocker-level findings.
- `M5-04` can focus on the final full-demo acceptance instead of re-proving the baseline mechanics.
