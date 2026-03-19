# M3-06 Technical Documentation

## Purpose

`M3-06` completes the MVP multi-drilldown contract on top of the `M3-04` single-link foundation. A node can now keep several linked child-model paths, open any of them through the shared navigation runtime, and remove one link without affecting the linked model files themselves.

## Architecture

- The persisted data model stays unchanged:
  - `Node.drilldowns[]` remains the single source of truth.
- Link management still flows through `updateNode()` and YAML persistence.
- The refinement is mostly client-side:
  - render all drill-down links
  - open each linked target independently
  - remove one specific link
  - keep broken-link recovery compatible with the same list-based contract

## Contracts And Data

- `ModelNode.drilldowns: string[]` remains the stable list of child model paths.
- Removing a link is implemented by writing a filtered `drilldowns` array back through the existing node patch API.
- Linked model files are unaffected because no filesystem delete operation is tied to link removal.

## Core Logic

- The properties panel now renders each linked model as an actionable entry.
- Each entry supports:
  - open target
  - show missing-state styling when the path no longer resolves
  - remove only that link
- Recovery flow for missing drill-down targets now supports:
  - create replacement
  - replace with selected existing model
  - remove broken link

## Verification Additions

- `test/project-service.test.mjs` now includes regression coverage confirming that removing one drill-down link leaves the remaining links and linked model files intact.
- `test/multi-drilldown-validation.mjs` exercises:
  - linking two child models to one node
  - opening both models through the navigation helpers
  - removing one link
  - reopen persistence
  - verifying that the removed child model file still exists

## Limitations

- The UI is still a compact list and does not include advanced selection affordances beyond direct actions.
- The recovery model stays path-based and intentionally lightweight.

## Integration Points For Next Issue

- `M3-07` can validate hierarchy milestone behavior using:
  - single drill-down
  - multiple drill-down
  - step-up
  - breadcrumbs/back
  - broken-link recovery
- The stable contract going forward is:
  - `Node.drilldowns[]` is a real multi-link list
  - add/open/remove semantics are supported without hidden file deletions
