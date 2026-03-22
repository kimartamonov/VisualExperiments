# 06. Target Behavior Spec

## Scope Note

This specification describes the **observable target behavior** for Sprint 2. It does not prescribe low-level implementation details unless the behavior would otherwise stay ambiguous.

## CH-01. Separate project browser and workspace into two screens

### Current behavior

- the browser and workspace are visible together in one root shell;
- opening a project does not switch the app into a dedicated workspace mode.

### Target behavior

- when no project is open, the app shows the project browser screen;
- when a project is opened, the app shows the project workspace screen;
- the project browser is not displayed alongside the workspace;
- the workspace screen provides an explicit control to return to the project browser.

### Acceptance criteria

- opening a project removes the browser panel from the active screen;
- the workspace uses the full app viewport instead of sharing it with the browser;
- returning to projects works without losing the ability to open another project immediately.

### Out of scope

- browser history deep-linking;
- multi-workspace tabs.

## CH-02. Move model creation into an on-demand modal

### Current behavior

- the create-model form is always present in the left panel above the tree.

### Target behavior

- the left panel shows project navigation first;
- model creation is launched by an explicit button;
- the button opens a modal dialog;
- the modal preserves the same useful inputs as today:
  - model name;
  - notation/freeform choice;
  - selected target context.

### Acceptance criteria

- the left panel no longer permanently reserves space for the full create-model form;
- a user can still create both freeform and typed models from the selected folder context;
- after creation, tree refresh and model opening behavior remain coherent.

### Out of scope

- multi-step creation wizard;
- model rename or move flow.

## CH-03. Compact the center panel and maximize canvas area

### Current behavior

- the center panel contains a large stack of text and cards above the actual canvas.

### Target behavior

- the center panel keeps only compact top-level actions and necessary context;
- the main editable canvas receives the majority of the vertical space;
- explanatory copy is reduced to a compact helper level instead of dominating the panel.

### Acceptance criteria

- on a `1920x1080` desktop, the canvas area is visually dominant in the center panel;
- the user can still reach core actions such as `Add frame` and `Create notation`;
- the center panel no longer feels vertically constrained by informational cards.

### Out of scope

- full visual redesign of all toolbars;
- zoom/pan system changes.

## CH-04. Move model context summary into the right properties panel

### Current behavior

- opened-model summary sits in the center panel above the canvas.

### Target behavior

- opened-model context lives in the right panel when no node, edge, or frame is selected;
- the right panel remains the primary place for contextual metadata;
- the center panel stops carrying a dedicated model-summary card.

### Acceptance criteria

- model name, path, notation state, and navigation depth remain visible somewhere appropriate;
- the center panel no longer uses a standalone `selection-card` for this information;
- right-panel behavior stays understandable when switching between object selection and model-level context.

### Out of scope

- redesign of node/frame/edge editing forms beyond what is needed for layout consistency.

## CH-05. Normalize breadcrumb and workspace-context density

### Current behavior

- breadcrumbs and current-context presentation feel oversized and spatially inefficient.

### Target behavior

- breadcrumb presentation becomes compact and width-efficient;
- the current model context is displayed without a giant header block;
- the container uses available width cleanly and wraps gracefully when needed.

### Acceptance criteria

- breadcrumb items no longer look oversized relative to their informational value;
- current-location context stays readable without taking multiple dominant visual rows;
- no obvious width mismatch or awkward clipping remains in the context area.

### Out of scope

- logical tree redesign beyond current breadcrumb path.

## CH-06. Replace button-based edge creation with drag-from-port connection

### Current behavior

- the user selects a node, presses `Create outgoing edge`, then clicks a target node.

### Target behavior

- nodes expose visible connection ports or equivalent direct connection handles;
- the user creates an edge by dragging from a source port to a target node or target port;
- edge deletion by selecting the edge remains available.

### Acceptance criteria

- a directed edge can be created without entering the old button-driven mode;
- the new connection path is available directly on the canvas;
- failed drags cancel cleanly without leaving the workspace in a broken state;
- existing edge deletion still works.

### Out of scope

- typed edges;
- edge labels;
- complex routing beyond the current straight directed connection style.

## CH-07. Make frames directly manipulable and support drop-to-membership

### Current behavior

- frames are selected on canvas but not directly moved or resized;
- membership is edited in the right panel via checkboxes.

### Target behavior

- frames can be selected and moved directly on the canvas;
- frames can be resized directly on the canvas;
- dropping a node into a frame gives that node membership in the frame;
- frame membership remains compatible with existing step-up semantics.

### Acceptance criteria

- frame position and size can be adjusted without editing node membership checkboxes;
- dragging a node into a frame updates frame membership;
- step-up still uses frame membership correctly after the change;
- frame metadata editing remains available in the right panel.

### Planning assumption

For Sprint 2, "node is inside frame" means:

- the node belongs to `frame.nodeIds`;
- no extra semantic edge or new domain relation is implied beyond existing frame semantics.

### Out of scope

- nested frames;
- automatic removal of membership in every ambiguous drag case unless explicitly implemented;
- redesign of step-up domain model.

## CH-08. Add collision constraints for nodes and frames

### Current behavior

- nodes and frames can overlap too freely during manual manipulation.

### Target behavior

- manual dragging or resizing should not allow major invalid overlap for:
  - node against node;
  - frame against frame;
- the system should keep the last valid position if the next move would violate the rule.

### Acceptance criteria

- node-node overlap is materially reduced or blocked during manual drag;
- frame-frame overlap is materially reduced or blocked during move and resize;
- the collision response feels deterministic rather than random;
- the user can still place nodes inside frames intentionally.

### Out of scope

- full automatic packing;
- automatic beautification layout;
- advanced physics or snapping engine.

## CH-09. Desktop polish pass for wrapping, sizing, and overflow

### Current behavior

- several headers, cards, buttons, and layout groups feel oversized or risk awkward wrapping.

### Target behavior

- primary desktop workspace behaves cleanly at `1920x1080`;
- buttons, breadcrumb items, and text blocks wrap without breaking layout;
- no primary control spills outside its intended container.

### Acceptance criteria

- the main project-browser screen and workspace screen remain visually stable on `1920x1080`;
- toolbar actions and context blocks do not overflow or clip;
- the final layout looks intentional rather than like a temporary debug shell.

### Out of scope

- dedicated mobile layouts;
- complete design-system rewrite.
