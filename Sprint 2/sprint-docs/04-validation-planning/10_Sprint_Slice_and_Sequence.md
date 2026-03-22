# 10. Sprint Slice and Sequence

## Slice Strategy

Sprint 2 should be executed in **vertical slices**, where each slice produces a visible improvement in the actual workspace experience.

## SS-01. Screen Separation

- Change IDs: `CH-01`
- User outcome:
  - the user enters the project browser first and the workspace second.
- Main result:
  - opening a project feels like entering a dedicated work mode.
- Recommended issues:
  - `S2-01`
- Dependencies:
  - none
- Demo checkpoint:
  - open project -> full workspace -> return to projects.

## SS-02. Workspace Density And Creation Flow

- Change IDs:
  - `CH-02`
  - `CH-03`
  - `CH-04`
  - `CH-05`
- User outcome:
  - the workspace is less cluttered and the canvas gets more usable area.
- Main result:
  - tree stays visible;
  - model creation moves on demand into a modal;
  - model context shifts out of the center panel;
  - breadcrumbs become compact.
- Recommended issues:
  - `S2-02`
  - `S2-03`
- Dependencies:
  - `SS-01`
- Demo checkpoint:
  - open project, create a model from the modal, and show the larger canvas-centered workspace.

## SS-03. Direct Edge Interaction

- Change IDs: `CH-06`
- User outcome:
  - edges are created directly on the canvas instead of through an indirect mode button.
- Main result:
  - the graph-editing loop feels faster and more natural.
- Recommended issues:
  - `S2-04`
- Dependencies:
  - `SS-02`
- Demo checkpoint:
  - drag from one node port to another and create/delete an edge.

## SS-04. Frame Geometry And Direct Manipulation

- Change IDs: `CH-07`
- User outcome:
  - frames behave like real movable containers.
- Main result:
  - frames gain direct move/resize;
  - membership can start from canvas interaction instead of only from the right panel.
- Recommended issues:
  - `S2-05`
  - `S2-06`
- Dependencies:
  - `SS-02`
- Demo checkpoint:
  - move or resize a frame, then drag a node into it and keep step-up semantics intact.

## SS-05. Spatial Constraints And Desktop Finish

- Change IDs:
  - `CH-08`
  - `CH-09`
- User outcome:
  - the workspace feels controlled and visually stable.
- Main result:
  - major overlap is prevented;
  - desktop spacing and wrapping are cleaned up;
  - full sprint validation can run.
- Recommended issues:
  - `S2-06`
  - `S2-07`
  - `S2-08`
  - `S2-09`
- Dependencies:
  - `SS-03`
  - `SS-04`
- Demo checkpoint:
  - full Sprint 2 walkthrough on `1920x1080` with no blocker regressions.

## Preferred Sequence

1. `S2-01` Separate project browser and workspace screens
2. `S2-02` Modalize model creation in the workspace
3. `S2-03` Compact workspace context and maximize canvas
4. `S2-04` Replace edge mode with drag-from-port connection
5. `S2-05` Persist frame geometry and enable direct frame manipulation
6. `S2-06` Add drop-to-frame membership and spatial collision rules
7. `S2-07` Run desktop overflow and spacing polish
8. `S2-08` Validate full Sprint 2 UX pass and regression safety
9. `S2-09` Fix critical and high blockers from validation

## Why This Sequence Is Preferred

- `S2-01` unlocks the most workspace area immediately.
- `S2-02` and `S2-03` remove the biggest layout pressure before interaction changes begin.
- `S2-04` can then refine node-to-node interaction on a stable canvas.
- `S2-05` must come before full frame collision work because geometry needs to be explicit first.
- `S2-08` should validate the whole sprint as a system, not as isolated fragments.

## Cut Lines If Capacity Shrinks

If scope must be reduced, the least damaging cut order is:

1. reduce `S2-07` polish depth before touching core structural changes;
2. narrow `S2-06` to deterministic collision basics before cutting direct frame manipulation;
3. do not cut `S2-01`, `S2-03`, or `S2-04`, because they address the clearest customer pain directly.
