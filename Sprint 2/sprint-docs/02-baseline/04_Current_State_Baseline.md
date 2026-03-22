# 04. Current State Baseline

## Baseline Summary

The current product is a **working MVP workspace** that already supports:

- project creation and opening;
- project tree navigation;
- freeform and typed models;
- node create/move/edit/delete;
- directed edge create/delete;
- frames as semantic containers with persisted `nodeIds`;
- drill-down and step-up;
- breadcrumbs and back navigation;
- notation extraction and typed-model creation;
- manual save and error recovery.

The customer feedback is therefore aimed at **interaction quality and workspace density**, not at restoring missing core capability.

## Entry Shell Baseline

Current behavior:

- the root app shell renders `browser-panel` and `workspace-panel` side by side;
- opening a project does not replace the browser section;
- the browser section remains visible and continues to consume layout width.

Observed implementation shape:

- `src/client/App.tsx` renders both panels inside `.screen-shell`;
- `src/client/styles.css` defines the root shell as a two-column grid:
  - browser: `minmax(320px, 420px)`
  - workspace: `minmax(0, 1fr)`

Practical result:

- even after a project opens, the workspace never becomes a full-screen editing mode.

## Workspace Header Baseline

Current behavior:

- the workspace opens with a large top toolbar area;
- the heading includes descriptive copy, current-context card, save-status card, and several buttons.

Key elements currently visible in the header:

- `Current model context`
- breadcrumb list
- save status card
- `Save project`
- `Back to projects`
- `Back`
- `Refresh tree`

Practical result:

- a significant amount of vertical space is consumed before the user reaches the actual canvas.

## Left Panel Baseline

Current behavior:

- the left panel shows `Project tree`;
- the new-model form is permanently embedded above the tree;
- the form includes:
  - model name;
  - notation selector;
  - creation target hints.

What already works well:

- project tree is functional;
- create-model flow is available;
- selected folder context is already reflected in the creation hints.

Current weakness:

- the left panel mixes navigation and creation in a way that reduces tree focus and density.

## Center Panel Baseline

Current behavior:

- the center panel has action buttons for:
  - add node;
  - add frame;
  - create notation;
- below the header it shows explanatory copy;
- below that it shows a `selection-card` with:
  - opened model;
  - path;
  - notation;
  - navigation depth;
- only after these blocks does the actual canvas stage begin.

Layout facts from CSS:

- `.placeholder-surface` is a column layout;
- `.canvas-stage` has `min-height: 360px`;
- the stage shares vertical space with multiple cards and banners above it.

Practical result:

- the canvas exists and works, but it is not visually prioritized enough for daily editing.

## Right Panel Baseline

Current behavior:

- the right panel is context-sensitive:
  - project properties when no model is open;
  - model properties when no object is selected;
  - node properties when a node is selected;
  - frame properties when a frame is selected;
  - edge properties when an edge is selected.

Important detail:

- the right panel currently does **not** own the main opened-model summary that sits above the center canvas.

## Breadcrumb And Context Baseline

Current behavior:

- breadcrumbs live inside `workspace-context-card` in the workspace header;
- breadcrumb buttons contain both model name and path;
- the whole context presentation feels large for the amount of information shown.

Practical result:

- the feature works functionally;
- the presentation is heavier than the customer wants.

## Edge Creation Baseline

Current behavior:

- the user selects a node;
- the right panel exposes `Create outgoing edge`;
- clicking the button toggles edge-creation mode;
- the user clicks another node to create the edge;
- selecting an edge allows deletion.

What works:

- directed edge creation exists;
- directed edge deletion exists;
- edge rendering is stable on the canvas.

What does not match the new expectation:

- edge creation is mode-based and indirect rather than gesture-based.

## Frame Baseline

Current behavior:

- a frame can be created from the center toolbar;
- a frame is selectable on the canvas;
- frame metadata is edited in the right panel;
- membership is managed through a checkbox list of node ids;
- step-up behavior is already supported.

Critical implementation detail:

- frame bounds are computed from `frame.nodeIds` through `getFrameBounds(...)`;
- when a frame has no members, it receives a default stacked placeholder position;
- frames do not have their own persisted geometry fields in the current schema.

Practical result:

- frames are semantic containers;
- frames are not first-class movable/resizable layout objects yet.

## Collision Baseline

Current behavior:

- nodes can be dragged freely;
- there is no collision prevention for node-node overlap;
- there is no collision prevention for frame-frame overlap;
- frame rendering does not reserve space against other frames.

Practical result:

- the canvas is flexible enough for MVP;
- the current behavior now looks too loose and messy for the next pass.

## Baseline Behaviors That Must Not Regress

- project browser create/open path;
- project tree refresh and selection;
- node dragging and property editing;
- edge delete by selection;
- frame step-up link and recovery path;
- drill-down create/open/remove flows;
- notation extraction and typed-model creation;
- save and reopen integrity;
- broken-link and invalid-YAML recovery behavior.
