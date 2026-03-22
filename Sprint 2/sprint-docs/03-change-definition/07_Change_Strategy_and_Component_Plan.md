# 07. Change Strategy and Component Plan

## Strategy Summary

Sprint 2 should be implemented as a **change-in-place refinement pass** over the current MVP, not as a rebuild.

The recommended strategy is:

1. change the app shell first;
2. compact the workspace second;
3. stabilize direct canvas interactions next;
4. only then add final polish and validation.

This order minimizes rework because layout changes affect almost every visible complaint.

## Recommended Implementation Strategy

### Phase A. Reframe the shell around two screens

Goal:

- turn the current side-by-side root shell into an explicit `browser mode` and `workspace mode`.

Why first:

- this is the biggest width unlocker;
- it simplifies later desktop polish;
- it aligns the app with the customer's main mental model.

Main areas affected:

- top-level view state in `src/client/App.tsx`
- root shell styling in `src/client/styles.css`

### Phase B. Clean the workspace information hierarchy

Goal:

- remove non-essential center-panel scaffolding;
- move model summary into the right panel;
- keep breadcrumbs compact and useful;
- modalize model creation.

Why second:

- these changes directly solve the "canvas too small" problem without touching graph semantics;
- they create a stable layout baseline for the later interaction work.

Main areas affected:

- workspace toolbar
- left-panel create-model flow
- center-panel header and helper copy
- right-panel model state
- breadcrumb container styling

### Phase C. Replace indirect graph interactions with direct ones

Goal:

- move edge creation to drag-from-port;
- turn frames into direct canvas containers rather than passive derived overlays.

Why third:

- these features change pointer behavior and should land on top of a stable layout;
- they are user-visible interaction upgrades, not just style tweaks.

Main areas affected:

- node rendering and pointer logic
- edge creation state machine
- frame rendering and drag/resize logic
- model persistence for frame geometry and membership

### Phase D. Add constraint logic and then polish

Goal:

- reduce invalid overlap states;
- finish overflow, wrapping, and desktop tuning;
- validate the whole Sprint 2 flow together.

Why last:

- collision rules depend on the final interaction contracts for nodes and frames;
- polish should happen after structural layout and interaction changes settle.

## Component And Surface Map

### App shell and view mode

Likely responsibilities:

- distinguish browser-screen state from workspace-screen state;
- preserve project open/close transitions;
- keep `Back to projects` as the explicit return path.

Likely change surfaces:

- `src/client/App.tsx`
- `src/client/styles.css`

### Left panel and model creation

Likely responsibilities:

- keep tree as the default left-panel content;
- open a modal for new-model creation;
- preserve selected folder target and notation choice.

Likely change surfaces:

- `src/client/App.tsx`
- `src/client/styles.css`

### Workspace header and breadcrumbs

Likely responsibilities:

- compact header density;
- move model summary out of center panel;
- reflow breadcrumb presentation.

Likely change surfaces:

- `src/client/App.tsx`
- `src/client/styles.css`

### Node connection model

Likely responsibilities:

- add visible connection handles;
- resolve source/target selection through drag;
- keep edge deletion intact.

Likely change surfaces:

- `src/client/App.tsx`
- `src/client/styles.css`

### Frame geometry and containment

Likely responsibilities:

- persist frame geometry;
- render frames from persisted bounds instead of only derived membership bounds;
- update membership on node drop;
- keep step-up compatible with frame membership.

Likely change surfaces:

- `src/client/api.ts`
- `src/client/App.tsx`
- `src/server/app.ts`
- `src/server/project-service.ts`
- YAML model shape

## Recommended Technical Assumptions

### A1. Frames should get persisted geometry

Reason:

- direct drag and resize are difficult to support reliably while frame bounds are only derived from current member nodes.

### A2. Drag ports should not reuse the old edge-mode button as the primary path

Reason:

- the customer complaint is specifically about the interaction being indirect.

### A3. Collision should use a simple deterministic rule

Recommended first rule:

- stop movement at the last valid position;
- do not introduce complex auto-layout behavior in this sprint.

## Alternatives Considered And Rejected

### Alternative R1. Keep the browser visible and just shrink it

Rejected because:

- the customer explicitly asked for separate screens;
- shrinking still wastes width on the workspace screen.

### Alternative R2. Keep the center selection card and only reduce its padding

Rejected because:

- it keeps metadata in the wrong place;
- it only partially solves the canvas-density complaint.

### Alternative R3. Add ports while keeping button-based edge mode as equal primary flow

Rejected because:

- it preserves the old indirect mental model;
- it adds complexity without solving the main complaint cleanly.

### Alternative R4. Fake frame dragging while keeping geometry derived only from membership

Rejected because:

- manual frame control and derived bounds will fight each other;
- resize especially becomes inconsistent.

## Recommended File-Level Focus Order

1. `src/client/App.tsx`
2. `src/client/styles.css`
3. `src/client/api.ts`
4. `src/server/app.ts`
5. `src/server/project-service.ts`
6. validation scripts or manual test notes affected by the new interaction flow
