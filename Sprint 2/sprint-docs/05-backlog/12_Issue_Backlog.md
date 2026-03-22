# 12. Issue Backlog

## Sprint 2 Backlog Summary

| Order | Issue ID | Type | Goal | Depends On | Change IDs |
|---|---|---|---|---|---|
| 1 | S2-01 | Implementation | Separate project browser and workspace screens | None | CH-01 |
| 2 | S2-02 | Implementation | Move model creation into an on-demand modal | S2-01 | CH-02 |
| 3 | S2-03 | Implementation | Compact workspace context and maximize canvas | S2-01 | CH-03, CH-04, CH-05 |
| 4 | S2-04 | Implementation | Replace edge mode with drag-from-port connection | S2-03 | CH-06 |
| 5 | S2-05 | Implementation | Persist frame geometry and enable direct frame manipulation | S2-03 | CH-07 |
| 6 | S2-06 | Implementation | Add drop-to-frame membership and spatial collision rules | S2-05 | CH-07, CH-08 |
| 7 | S2-07 | Implementation | Run desktop overflow and spacing polish | S2-02, S2-03, S2-04, S2-06 | CH-09 |
| 8 | S2-08 | Validation | Validate full Sprint 2 UX pass and regression safety | S2-04, S2-06, S2-07 | CH-01, CH-02, CH-03, CH-04, CH-05, CH-06, CH-07, CH-08, CH-09 |
| 9 | S2-09 | Fix | Fix critical and high Sprint 2 blockers | S2-08 | blocker output from S2-08 |

## Detailed Issues

### S2-01. Separate project browser and workspace screens

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-01`
- Priority: `P0`
- Change IDs: `CH-01`
- Depends On: `None`
- Goal:
  - switch the current root shell from side-by-side browser/workspace into a true two-screen flow.
- Scope:
  - browser-first entry screen;
  - workspace-only screen after project open;
  - explicit return to project browser.
- Out of Scope:
  - deep-link routing redesign;
  - multi-tab workspace support.
- Affected Areas:
  - top-level app shell;
  - browser/workspace render logic;
  - root layout CSS.
- Acceptance:
  - browser is not visible beside an opened workspace;
  - opening a project enters workspace mode;
  - returning to project list works cleanly.
- Required Checks:
  - run `V1`;
  - smoke open project -> back to projects -> open another project.
- Handoff:
  - unlocks workspace-width and layout changes for later issues.

### S2-02. Move model creation into an on-demand modal

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-02`
- Priority: `P1`
- Change IDs: `CH-02`
- Depends On: `S2-01`
- Goal:
  - free the left panel from the permanent create-model form.
- Scope:
  - add explicit create-model trigger;
  - open modal with current form capabilities;
  - preserve selected tree target context.
- Out of Scope:
  - rename/move model flows;
  - multi-step wizards.
- Affected Areas:
  - left-panel UI;
  - create-model flow state;
  - modal styling and layout.
- Acceptance:
  - tree remains visible without the permanent embedded form;
  - modal can still create freeform and typed models;
  - tree refresh and workspace coherence remain intact.
- Required Checks:
  - run `V2`;
  - sanity-check create-model path in both freeform and typed modes.
- Handoff:
  - leaves the workspace left panel ready for final density polish.

### S2-03. Compact workspace context and maximize canvas

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-02`
- Priority: `P0`
- Change IDs: `CH-03`, `CH-04`, `CH-05`
- Depends On: `S2-01`
- Goal:
  - reclaim center-panel space and move metadata to more appropriate locations.
- Scope:
  - compact workspace header;
  - move model summary from center panel to right-panel model context;
  - normalize breadcrumb/context presentation;
  - increase practical canvas footprint.
- Out of Scope:
  - total redesign of all property forms;
  - zoom/pan feature work.
- Affected Areas:
  - workspace toolbar;
  - breadcrumb container;
  - center-panel helper stack;
  - right-panel model state.
- Acceptance:
  - center panel no longer carries the old selection card;
  - model context remains visible in the right panel;
  - canvas is visually dominant on `1920x1080`;
  - breadcrumb area is compact and readable.
- Required Checks:
  - run `V3`;
  - verify no regressions in model open, breadcrumb navigation, and object property panels.
- Handoff:
  - establishes the stable layout baseline for later graph-interaction issues.

### S2-04. Replace edge mode with drag-from-port connection

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-03`
- Priority: `P0`
- Change IDs: `CH-06`
- Depends On: `S2-03`
- Goal:
  - make edge creation direct on the canvas.
- Scope:
  - add source connection affordance on node;
  - support drag preview to target;
  - create directed edge on valid drop;
  - keep edge deletion behavior.
- Out of Scope:
  - typed edges;
  - edge labels;
  - advanced routing.
- Affected Areas:
  - node UI;
  - pointer interaction handling;
  - edge-creation state;
  - canvas visuals.
- Acceptance:
  - user can create an edge without the old button-driven mode as the main path;
  - invalid drag cancels cleanly;
  - existing delete-on-select still works.
- Required Checks:
  - run `V4`;
  - regression-check node drag and edge delete.
- Handoff:
  - stabilizes the new graph-linking contract for the sprint.

### S2-05. Persist frame geometry and enable direct frame manipulation

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-04`
- Priority: `P0`
- Change IDs: `CH-07`
- Depends On: `S2-03`
- Goal:
  - convert frames from purely derived overlays into directly manipulated canvas containers.
- Scope:
  - persist frame geometry;
  - render frame from persisted bounds;
  - support direct frame move and resize;
  - preserve compatibility with frame metadata and step-up behavior.
- Out of Scope:
  - nested frames;
  - full containment automation logic.
- Affected Areas:
  - frame schema and API;
  - server model persistence;
  - frame rendering and pointer behavior.
- Acceptance:
  - frame can be moved and resized directly;
  - changes survive save/reopen;
  - step-up still works with the frame after geometry changes.
- Required Checks:
  - run the frame portions of `V5`;
  - regression-check save/reopen and step-up path.
- Handoff:
  - unlocks membership-on-drop and collision rules built on explicit frame geometry.

### S2-06. Add drop-to-frame membership and spatial collision rules

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-04`, `SS-05`
- Priority: `P0`
- Change IDs: `CH-07`, `CH-08`
- Depends On: `S2-05`
- Goal:
  - complete the new frame interaction model and prevent major invalid overlap states.
- Scope:
  - node drop into frame updates membership;
  - node-node collision control;
  - frame-frame collision control;
  - deterministic hard-stop rule at last valid position.
- Out of Scope:
  - auto-layout;
  - collision-based beautification;
  - full automatic membership removal on every exit case.
- Affected Areas:
  - node drag/drop handling;
  - frame containment logic;
  - spatial validation utilities.
- Acceptance:
  - dragging a node into a frame adds membership;
  - major node-node overlap is prevented;
  - major frame-frame overlap is prevented;
  - nodes can still intentionally live inside frames.
- Required Checks:
  - run `V5` and `V6`;
  - regression-check frame metadata and step-up after membership changes.
- Handoff:
  - delivers the new controlled canvas-spatial behavior expected from Sprint 2.

### S2-07. Run desktop overflow and spacing polish

- Type: `Implementation`
- Status: `Proposed`
- Sprint Slice: `SS-05`
- Priority: `P1`
- Change IDs: `CH-09`
- Depends On:
  - `S2-02`
  - `S2-03`
  - `S2-04`
  - `S2-06`
- Goal:
  - normalize wrapping, sizing, spacing, and remaining desktop rough edges after the main changes land.
- Scope:
  - toolbar wrapping;
  - breadcrumb/control sizing;
  - panel spacing;
  - visible overflow cleanup on `1920x1080`.
- Out of Scope:
  - full design-system rewrite;
  - mobile layout work.
- Affected Areas:
  - workspace shell CSS;
  - button groups;
  - context cards;
  - panel spacing.
- Acceptance:
  - no major overflow or clipped controls remain in the primary sprint flow;
  - main screens feel visually balanced on the target desktop viewport.
- Required Checks:
  - run `V7`;
  - repeat quick pass across browser and workspace screens.
- Handoff:
  - prepares the sprint for full validation without cosmetic noise dominating the blocker list.

### S2-08. Validate full Sprint 2 UX pass and regression safety

- Type: `Validation`
- Status: `Proposed`
- Sprint Slice: `SS-05`
- Priority: `P0`
- Change IDs:
  - `CH-01`
  - `CH-02`
  - `CH-03`
  - `CH-04`
  - `CH-05`
  - `CH-06`
  - `CH-07`
  - `CH-08`
  - `CH-09`
- Depends On:
  - `S2-04`
  - `S2-06`
  - `S2-07`
- Goal:
  - validate the complete Sprint 2 experience as one coherent pass.
- Scope:
  - run `V1` through `V8`;
  - capture blocker list;
  - collect acceptance evidence.
- Out of Scope:
  - fixing blockers inside the same issue.
- Affected Areas:
  - entire Sprint 2 workspace flow.
- Acceptance:
  - validation artifacts exist;
  - blocker list is explicit;
  - regressions are classified by severity.
- Required Checks:
  - execute the full validation plan from `09_Validation_and_Regression_Plan.md`.
- Handoff:
  - produces the input for `S2-09`.

### S2-09. Fix critical and high Sprint 2 blockers

- Type: `Fix`
- Status: `Proposed`
- Sprint Slice: `SS-05`
- Priority: `P0`
- Change IDs: `blockers from S2-08`
- Depends On: `S2-08`
- Goal:
  - resolve only the critical and high issues found in full sprint validation.
- Scope:
  - blocker fixes required for acceptance.
- Out of Scope:
  - low-priority polish that does not block acceptance.
- Affected Areas:
  - determined by validation findings.
- Acceptance:
  - all critical and high blockers from `S2-08` are either fixed or explicitly disproven.
- Required Checks:
  - rerun only the relevant validation scenarios plus affected regressions.
- Handoff:
  - closes the Sprint 2 change package and prepares the next execution prompt.
