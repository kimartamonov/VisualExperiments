# 01. Sprint Context and Goals

## Sprint Snapshot

- Sprint: `Sprint 2`
- Planning date: `2026-03-19`
- Product: `VisualExperiments`
- Input artifacts:
  - `Sprint 2/Sprint 2 Comments.txt`
  - `Brief.txt`
  - `Additional Brief.txt`
  - current MVP codebase
  - existing `Issue-Tree/` and `IssueReleaseJournal.md`
- Baseline state:
  - MVP implementation queue `M1-M5` is closed.
  - Core product path works end-to-end.
  - Next pass is driven by customer review after the first MVP release.

## Why This Sprint Exists

`Sprint 2` is not a new MVP-definition phase. It is a **post-MVP UX and interaction refinement pass** for an already working desktop application.

The customer feedback shows a clear pattern:

- the workspace is functionally rich enough to continue;
- the main problem is now **space, flow, and directness of interaction**;
- the current shell still exposes too much scaffolding from the implementation phase;
- graph operations that worked for MVP are still too indirect for comfortable daily use.

## Main Goal

Turn the current MVP workspace into a more direct and spacious desktop editing environment, while preserving already working behaviors:

- project create/open;
- model tree navigation;
- node editing;
- frame and step-up semantics;
- drill-down flows;
- notation extraction and typed-model flows;
- save/reopen and recovery paths.

## Sprint Success Criteria

Sprint 2 is successful if, after implementation:

1. The app works as a two-step flow: project browser first, workspace second.
2. After opening a project, the workspace gets materially more usable screen area on a `1920x1080` desktop.
3. New model creation no longer permanently occupies the left panel and instead opens on demand.
4. Edge creation feels direct on the canvas and no longer depends on the `Create outgoing edge` button as the main path.
5. Frames become manipulable canvas objects rather than passive boxes derived only from checkbox membership.
6. Manual layout behavior becomes more controlled: major overlaps and UI overflow are reduced or blocked.
7. The existing MVP scenarios still work without regression.

## Sprint Themes

### Theme T1. Screen separation

Move from "browser + workspace always visible" to:

- screen 1: project selection and creation;
- screen 2: active project workspace.

### Theme T2. Canvas-first workspace

Rebalance the workspace so the center canvas becomes the visual and spatial priority.

### Theme T3. Secondary flows on demand

Keep creation and context tools available, but do not let them permanently consume panel space.

### Theme T4. Direct manipulation

Replace indirect graph editing patterns with direct canvas gestures wherever possible.

### Theme T5. Desktop polish

Make the interface behave cleanly on standard desktop width and height without text spill, giant headers, or broken wrapping.

## Non-Goals For This Sprint

The following topics are explicitly outside Sprint 2 scope:

- mobile or tablet support;
- multi-user collaboration;
- typed edges or edge labels;
- notation editor UI;
- deep redesign of step-up/drill-down domain semantics;
- autosave architecture;
- full automatic layout engine;
- broad visual redesign unrelated to the feedback themes above.

## Decision Ownership

- Product and UX trade-offs: customer.
- Implementation path and technical decomposition: executor.
- Working planning assumptions inside this sprint package are allowed if they unblock issue generation, but they must be listed explicitly in `08_Decisions_Open_Questions_and_Deferments.md`.

## Planning Lens

This sprint package is built with one practical objective:

> convert the post-release customer comments into a compact, traceable, and sequential issue backlog for the next implementation pass.
