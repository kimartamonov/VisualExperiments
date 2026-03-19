# M3-01 Technical Documentation

## Decision

`DB-17` is accepted for MVP with the policy: create once, open existing by default, regenerate only on explicit command.

## Stable contract

- `Frame.stepUp` remains `null` until the first successful step-up.
- The first successful step-up creates the target model and representative node, then stores `{ model, nodeId }` in `frame.stepUp`.
- The stored path is root-relative and the link identity relies on stable ids rather than `Frame.name`.
- A repeated default step-up on a linked frame opens or reuses the existing target.
- Regeneration or refresh of the generated representation is a separate explicit command.
- No live sync and no automatic propagation from upper-level changes back to the source frame are part of MVP.

## Downstream impact

- `M3-02` must prove the feasibility of create/open-existing/manual-regenerate behavior without background reconciliation.
- `M3-05` must implement step-up so that reuse is the default repeated action and regenerate/update is separate.
- Future richer sync remains possible later, but it is intentionally not a requirement for MVP.
