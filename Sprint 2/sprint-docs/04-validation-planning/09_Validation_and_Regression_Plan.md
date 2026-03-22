# 09. Validation and Regression Plan

## Validation Goal

Sprint 2 should be accepted not by isolated screenshots, but by proving two things together:

1. the workspace became more direct and spacious for the target desktop flow;
2. the existing MVP behaviors still work.

## Primary Test Environment

- primary viewport: `1920x1080`
- device class: desktop
- browser expectation: modern desktop browser already used for MVP acceptance

## Validation Scenarios

### V1. Screen-flow validation

Goal:

- confirm that browser and workspace now behave as separate screens.

Checks:

- app starts on project browser screen;
- opening a project switches to workspace screen;
- browser panel is no longer visible beside the workspace;
- `Back to projects` returns to the browser screen cleanly.

### V2. Model-creation modal validation

Goal:

- confirm that left-panel density improves without losing create-model capability.

Checks:

- left panel no longer permanently shows the full create-model form;
- modal opens from an explicit trigger;
- modal preserves model name, notation choice, and selected target context;
- create-model flow still refreshes tree and keeps the workspace coherent.

### V3. Canvas-density validation

Goal:

- confirm that the center panel now prioritizes the editable surface.

Checks:

- canvas visually dominates the center panel on `1920x1080`;
- major top-level actions remain accessible;
- selection-card-style model summary no longer occupies center-panel space;
- breadcrumb/context area feels compact and readable.

### V4. Direct-edge-interaction validation

Goal:

- confirm that edge creation no longer depends on the old indirect mode as the main path.

Checks:

- drag from a source port creates a connection preview;
- dropping onto a valid target creates the directed edge;
- invalid drop cancels cleanly;
- selecting an edge still allows deletion.

### V5. Frame-manipulation validation

Goal:

- confirm that frames behave as first-class canvas containers.

Checks:

- frame can be selected and moved directly;
- frame can be resized directly;
- dragging a node into a frame updates membership;
- frame metadata and step-up still remain usable afterward.

### V6. Collision validation

Goal:

- confirm that layout constraints now reduce invalid overlap states.

Checks:

- node-node overlap is blocked or materially reduced during manual drag;
- frame-frame overlap is blocked or materially reduced during move/resize;
- intentional node placement inside a frame is still possible;
- collision behavior is stable and deterministic.

### V7. Desktop-polish validation

Goal:

- confirm that wrapping, button sizing, and spacing look intentional on the target screen.

Checks:

- no major toolbar overflow;
- no clipped breadcrumb or button labels;
- no obvious panel spill, broken wrapping, or accidental overlap in the workspace shell.

### V8. Full regression validation

Goal:

- confirm that Sprint 2 did not break established MVP flows.

Checks:

- project create/open;
- tree navigation and refresh;
- node create/move/edit/delete;
- frame step-up open/regenerate;
- drill-down create/open/remove;
- notation extraction;
- typed-model creation and reopen;
- manual save and reopen;
- recovery behavior for broken links or invalid artifacts.

## Evidence Expectations

For sprint acceptance, gather:

- before/after screenshots for main shell changes;
- a short walkthrough or screen recording for direct edge creation and frame interaction;
- manual validation notes for the regression set;
- explicit list of any residual low-priority defects that do not block acceptance.

## Acceptance Rule

Sprint 2 should be considered complete only if:

- `V1` through `V7` pass at the primary desktop viewport;
- `V8` shows no critical or high regression in existing MVP flows.
