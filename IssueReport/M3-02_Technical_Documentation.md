# M3-02 Technical Documentation

## Purpose

`M3-02` proves that the accepted `M3-01` step-up semantics are technically viable in the current file-based architecture before the production navigation slices are implemented.

## Architectural Approach

- Keep the spike at backend/data-contract level plus dedicated validation artifacts.
- Reuse the existing YAML model persistence and `ProjectService` model APIs instead of inventing a parallel prototype storage layer.
- Treat navigation context as runtime-only proof data, not persisted project state.
- Prove the create/open-existing/explicit-regenerate contract with a deterministic script rather than shipping partial UI behavior.

## Contracts And Data Structures

### `ModelFrame.stepUp`

- Location: `src/server/project-service.ts`
- Contract:
  - `null` when no upper-level link exists yet
  - `{ model: string; nodeId: string }` when a canonical upper-level target has already been established

### `StepUpLink`

- Shape:
  - `model`: relative path to the upper-level model file
  - `nodeId`: stable representative node id inside that upper-level model

This aligns persistence with the accepted `M3-01` semantics: frame edits and membership changes do not automatically invalidate the canonical upper-level link.

## Key Logic

### Persistence Safeguard

- `isModelFrame()` now accepts either `null` or a valid `StepUpLink`.
- `updateFrame()` preserves the existing `stepUp` link during metadata and membership edits.
- Node deletion removes node ids from `frame.nodeIds` but does not silently reset `frame.stepUp`.

### Regression Test

- File: `test/project-service.test.mjs`
- Added coverage proving that:
  - models with non-null `stepUp` reopen correctly;
  - frame updates preserve the link;
  - membership cleanup after node deletion also preserves the link.

### Spike Validation Harness

- File: `test/step-up-spike-validation.mjs`
- The harness proves:
  - first default step-up creates upper-level model + representative node + persisted link;
  - repeated default step-up reuses the same target without duplicate generation;
  - explicit regenerate updates the existing representative node in place;
  - source and upper-level models still reopen after a fresh `ProjectService` instance;
  - runtime navigation context can carry enough data for returning back to the source model later.

## Limitations

- This issue does not expose the spike as a production UI feature.
- No live sync is implemented.
- No background reconciliation is implemented.
- No persisted breadcrumb or back-stack state is introduced.
- Missing-link UX fallback is not the main focus here and remains for later navigation work.

## Integration Points

- `M3-03` can reuse the proven runtime navigation-context concept for breadcrumbs/back behavior.
- `M3-05` can reuse the proven create/open-existing/explicit-regenerate contract for the actual step-up implementation.
- Later M3 validation issues can rely on the new regression coverage to catch accidental `stepUp` link loss.

## What The Next Issue Can Rely On

- `frame.stepUp` is now a stable persisted contract instead of a forced-null placeholder.
- The architecture supports a non-live-sync step-up model without duplicate generation.
- Cross-model round-trip viability is proven locally and can be used as the basis for shared navigation behavior in `M3-03`.
