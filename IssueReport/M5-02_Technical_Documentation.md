# M5-02 Technical Documentation

## Purpose

`M5-02` stabilizes the MVP against file-based unhappy paths. The goal is not to repair broken artifacts automatically, but to ensure that invalid YAML, missing linked models, and missing notation artifacts fail with readable messages while the rest of the workspace remains usable.

## Architecture

- `src/server/project-service.ts` is now the source of truth for YAML parse recovery:
  - broken YAML in manifest/model/notation readers is normalized into `ValidationError`
  - notation registry loading skips invalid or missing notation artifacts instead of failing the whole project load
  - typed-model node creation uses a safe notation lookup and falls back to freeform behavior when the notation artifact cannot be resolved
- `src/client/App.tsx` consumes those failures through the existing workspace error surface and adds contextual recovery hints based on the returned error text.
- `src/client/styles.css` adds a dedicated notation recovery banner so fallback state is visible in the shell instead of being implicit.
- `test/project-service.test.mjs` captures artifact-level recovery regressions at the service layer.
- `test/error-recovery-validation.mjs` validates the full HTTP/runtime contract over restart.

## Data And Contract Notes

- Persisted YAML remains the source of truth; recovery logic does not rewrite or silently repair broken files during open.
- A model with `notation != freeform` may reopen without its notation artifact being resolvable:
  - the persisted `model.notation` value is preserved
  - notation registry queries may return no usable artifact
  - typed-node creation constraints relax into freeform fallback until the notation artifact is restored
- Broken drill-down and step-up targets remain persisted links; recovery is exposed through readable failure and explicit regenerate/open-another-target behavior rather than mutation on read.

## Key Logic

- YAML parse failures are caught at read time and mapped to stable validation messages:
  - `Invalid project manifest at "..."`
  - `Invalid model document at "..."`
  - `Invalid notation document at "..."`
- Notation lookup now has two modes:
  - strict resolution for flows that truly require a registered notation artifact
  - tolerant resolution for typed-model editing fallback when the artifact is missing or invalid
- Client-side model-open errors append recovery guidance so the user gets a next action rather than only the raw failure text.
- Workspace context explicitly marks notation fallback mode when a model still references a notation id that the current project load cannot resolve.

## Integration Points

- Existing navigation recovery from M3 continues to handle broken drill-down or step-up targets; `M5-02` builds on that by improving failure localization and messaging.
- Existing save contract from `M5-01` remains unchanged; this issue only hardens unhappy-path reads and fallback behavior.
- `M5-03` can now validate recovery behavior together with round-trip persistence because the unhappy-path contract is stable at both service and UI messaging layers.

## Limitations

- Recovery is message-driven, not wizard-driven.
- Missing notation fallback intentionally favors continuity over strict typed-model enforcement until the notation file is restored.
- Project-level manifest corruption is still a hard failure for that project.

## What The Next Issue Can Rely On

- Invalid YAML in model or notation files now fails predictably with readable validation messages.
- Broken linked-model targets are localized and do not collapse the rest of the workspace.
- Missing notation artifacts no longer prevent reopening affected models or continuing in freeform fallback mode where permitted.
- `validate:m5:recovery` now exists as a reusable regression/acceptance gate for later milestone work.
