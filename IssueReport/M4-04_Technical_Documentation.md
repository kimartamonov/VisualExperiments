# M4-04 Technical Documentation

## Purpose

`M4-04` formalizes the typing-and-notation milestone exit gate. Instead of validating `M4-01`, `M4-02`, and `M4-03` as isolated slices, it proves that the semantic bridge `freeform -> late typing -> notation -> typed model` works as one continuous path.

## Validation Architecture

- `test/typing-notation-validation.mjs` is the new integrated acceptance pass for the milestone.
- The script uses the built server through `dist/server/app.js`, matching the same integration style as earlier milestone gates.
- The scenario creates one project and runs two complete semantic loops inside it:
  - loop A: typed freeform graph -> notation extraction -> typed model creation -> typed-node creation
  - loop B: second typed freeform model -> second notation extraction -> second typed model creation
- The script then restarts the server and reopens all artifacts to confirm persistence.

## Coverage

- `AC-9`
  - validated by assigning persisted typing metadata to freeform nodes
  - validated alongside existing edges and frames to prove graph integrity survives late typing
- `AC-10`
  - validated by extracting notation artifacts from typed freeform models
  - validated by checking manifest registration and notation file persistence for more than one source model
- `AC-11`
  - validated by creating typed models from registered notations
  - validated by creating typed nodes whose type or color comes from the selected notation

## Contracts Proven Stable

- Freeform models can accumulate typing metadata without losing existing graph artifacts.
- Notation extraction persists a stable bridge artifact and registers it in `project.yaml`.
- Typed models can bind to persisted notation ids and round-trip with those references intact.
- A project can host multiple notation artifacts and multiple typed models derived from them without context loss.

## Regression Strategy

- `validate:m4` focuses on the connected M4 path itself.
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

## Limitations

- This issue validates and documents the milestone state; it does not introduce new typing or notation features.
- Defect remediation remains intentionally deferred to `M4-05`.
- Full-system persistence hardening across the final acceptance sequence remains in M5.

## What The Next Issue Can Rely On

- `validate:m4` is now the single milestone gate for the typing-and-notation workflow.
- The M4 semantic bridge is validated end-to-end with reopen persistence.
- No blocker-level findings were found during the closeout pass, so `M4-05` can act as a formal bugfix slot unless new defects are introduced.
