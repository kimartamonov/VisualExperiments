# 03. Change Register

## Purpose Of This Register

This register converts the raw customer review into **atomic change-items**. These items are the planning source of truth for the rest of the sprint package.

## Accepted Change Items

### CH-01. Separate project browser and workspace into two screens

- Sources: `FB-01`, `FB-02`
- Type: `Navigation`, `Layout`
- Symptom:
  - the browser remains visible even after a project is opened;
  - it permanently consumes width needed by the workspace.
- Interpreted need:
  - entering a project should feel like entering a dedicated work mode.
- Expected user outcome:
  - screen 1 is for project selection/creation;
  - screen 2 is for project work;
  - the user can return explicitly to the browser screen.
- Priority: `P0`
- Status: `Accepted`

### CH-02. Move model creation out of the left panel into an on-demand modal

- Sources: `FB-03`
- Type: `UX`, `Layout`
- Symptom:
  - the permanent create-model form takes useful left-panel space away from the tree.
- Interpreted need:
  - model creation should stay available without reducing tree readability.
- Expected user outcome:
  - the left panel primarily shows project tree and navigation;
  - the new-model form opens only when requested.
- Priority: `P1`
- Status: `Accepted`

### CH-03. Compact the center panel header and maximize canvas area

- Sources: `FB-04`
- Type: `Layout`, `UX`
- Symptom:
  - too much vertical space above the actual editable canvas.
- Interpreted need:
  - the editing surface should dominate the workspace, not the scaffolding around it.
- Expected user outcome:
  - the user gets noticeably more working area for node movement and visual editing.
- Priority: `P0`
- Status: `Accepted`

### CH-04. Move model context summary from the center panel into the right panel

- Sources: `FB-05`
- Type: `Information architecture`, `Layout`
- Symptom:
  - opened-model context currently occupies prime center-panel space.
- Interpreted need:
  - model metadata should remain visible, but not in the middle of the editing surface.
- Expected user outcome:
  - model context stays accessible in the properties area when no node/edge/frame overrides it.
- Priority: `P1`
- Status: `Accepted`

### CH-05. Normalize breadcrumb and workspace-context density

- Sources: `FB-06`
- Type: `Navigation`, `Layout`
- Symptom:
  - breadcrumbs and context presentation feel oversized and spatially inefficient.
- Interpreted need:
  - current-location context should be compact, readable, and width-efficient.
- Expected user outcome:
  - breadcrumbs use the available row width better and stop feeling like a giant card.
- Priority: `P1`
- Status: `Accepted`

### CH-06. Replace button-based edge creation with drag-from-port connection

- Sources: `FB-07`
- Type: `Canvas interaction`
- Symptom:
  - edge creation depends on selecting a node, entering edge mode, then clicking another node.
- Interpreted need:
  - graph linking should happen directly on the canvas.
- Expected user outcome:
  - the user creates an edge by dragging from one node port to another node.
- Priority: `P0`
- Status: `Accepted`

### CH-07. Make frames directly manipulable and support drop-to-membership

- Sources: `FB-08`
- Type: `Canvas interaction`, `Frame behavior`
- Symptom:
  - frames are not directly movable or resizable;
  - membership is edited indirectly through the right panel.
- Interpreted need:
  - frames should behave like first-class canvas containers.
- Expected user outcome:
  - frames can be moved and adjusted directly;
  - dragging a node into a frame makes that node belong to the frame.
- Priority: `P0`
- Status: `Accepted with planning assumptions`

### CH-08. Add collision constraints for nodes and frames

- Sources: `FB-09`
- Type: `Canvas interaction`, `Layout control`
- Symptom:
  - nodes and frames can overlap too freely during manual editing.
- Interpreted need:
  - the canvas should resist obviously invalid or messy overlap states.
- Expected user outcome:
  - dragging or resizing objects no longer allows major frame-frame or node-node overlap.
- Priority: `P0`
- Status: `Accepted with design decision required`

### CH-09. Run a desktop polish pass for wrapping, sizing, and overflow

- Sources: `FB-10`, `FB-04`, `FB-06`
- Type: `UI polish`, `Responsive desktop layout`
- Symptom:
  - button groups, labels, and context blocks may feel crowded or spill awkwardly.
- Interpreted need:
  - the post-MVP workspace should look intentional and stable on a normal desktop screen.
- Expected user outcome:
  - no obvious overflow, broken wrapping, or mis-sized controls during the primary workspace flow.
- Priority: `P1`
- Status: `Accepted`

## Planning Notes

- No feedback item is rejected at this stage.
- The only areas that still need assumptions are frame geometry and exact collision rules.
- Those assumptions are formalized in `08_Decisions_Open_Questions_and_Deferments.md` so issue planning can proceed.
