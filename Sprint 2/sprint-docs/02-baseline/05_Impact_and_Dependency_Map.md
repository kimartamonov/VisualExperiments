# 05. Impact and Dependency Map

## Why This Map Matters

The customer comments look like a list of UI tweaks, but several of them are not isolated cosmetic changes. Some are **structural unlockers** that affect many downstream complaints at once.

## Change Clusters

### Cluster A. Screen flow and shell structure

Includes:

- `CH-01`
- `CH-02`
- part of `CH-09`

Main affected areas:

- root app shell state and conditional rendering;
- browser/workspace entry flow;
- workspace width allocation;
- left-panel creation flow.

Likely files and modules:

- `src/client/App.tsx`
- `src/client/styles.css`

Main insight:

- separating browser and workspace is not a cosmetic tweak;
- it is the biggest immediate width unlocker for the whole editing surface.

### Cluster B. Workspace density and information placement

Includes:

- `CH-03`
- `CH-04`
- `CH-05`
- part of `CH-09`

Main affected areas:

- workspace toolbar;
- workspace context card;
- breadcrumbs;
- center-panel information hierarchy;
- right-panel model-properties state.

Likely files and modules:

- `src/client/App.tsx`
- `src/client/styles.css`

Main insight:

- many "canvas is too small" complaints can be reduced by one shared redesign of the workspace header and context placement.

### Cluster C. Direct graph connection

Includes:

- `CH-06`

Main affected areas:

- node visual rendering;
- pointer interaction model;
- edge creation state;
- edge preview and hit testing;
- accessibility of connection affordances.

Likely files and modules:

- `src/client/App.tsx`
- `src/client/styles.css`
- potentially shared interaction helpers if extracted

Main insight:

- this change is logically independent from shell layout, but it alters the node interaction contract and must be handled carefully around drag behavior.

### Cluster D. Frame direct manipulation and containment

Includes:

- `CH-07`
- `CH-08`

Main affected areas:

- frame schema;
- frame rendering;
- drag and resize interaction;
- node drop handling;
- collision rules;
- step-up compatibility.

Likely files and modules:

- `src/client/App.tsx`
- `src/client/api.ts`
- `src/server/app.ts`
- `src/server/project-service.ts`
- persisted model YAML format

Main insight:

- this is the deepest technical cluster in Sprint 2 because current frames are derived from membership, not from persisted geometry.

## Shared Unlocker Changes

### U1. Screen separation unlocks canvas width

If `CH-01` is implemented first:

- the workspace immediately gains horizontal space;
- several complaints about panel crowding become easier to solve;
- some wrapping issues from `CH-09` may shrink without special handling.

### U2. Header compaction unlocks canvas height

If `CH-03`, `CH-04`, and `CH-05` are solved together:

- the center panel gains meaningful vertical space;
- the workspace feels less scaffold-heavy;
- the need for additional micro-polish in the center panel decreases.

### U3. Persisted frame geometry unlocks real frame manipulation

Without an explicit geometry model for frames:

- direct frame drag is unreliable;
- direct frame resize is unnatural;
- collision rules for frames become inconsistent;
- derived bounds from `nodeIds` keep fighting manual frame control.

### U4. Shared collision logic should be reused

If collision handling is introduced:

- nodes and frames should use one coherent rule set;
- otherwise users will learn two conflicting spatial behaviors on the same canvas.

## Dependency View

### Recommended dependency chain

1. `CH-01` before `CH-03` and `CH-09`
2. `CH-02` after `CH-01`
3. `CH-03`, `CH-04`, and `CH-05` as one layout-density pass
4. `CH-06` after layout baseline is stable
5. `CH-07` before full `CH-08`
6. `CH-09` as a final polish pass after structural changes land

### Why this order is recommended

- it is wasteful to polish wrapping before the screen split and header compaction;
- it is risky to define frame collision before deciding how frame geometry is represented;
- edge interaction can proceed independently once the main canvas layout stabilizes.

## Key Risks

### R2-01. Frame geometry may require a schema extension

Current schema stores frame membership and step-up link, but not independent frame bounds. Sprint 2 likely needs explicit geometry fields.

### R2-02. Node drag and edge-port drag may conflict

Ports and node dragging will share pointer space on the same card. Event handling needs a clean separation.

### R2-03. Overly strict collision may make editing frustrating

The customer asked for less overlap, not for a heavy automatic layout system. Collision rules should stop invalid overlap without making placement feel blocked everywhere.

### R2-04. Layout work can accidentally regress typed and hierarchy flows

The current workspace already supports multiple feature families. Shell refactoring must preserve:

- drill-down;
- step-up;
- notation extraction;
- typed-model editing.

## Minimal-Change Thesis

The sprint should deliberately avoid unnecessary deep changes where a structural fix already solves multiple symptoms.

Most important example:

- `CH-01` plus `CH-03/04/05` will probably solve a large part of the "canvas too small / controls too big / wrapping awkward" problem.

However, two requests remain independently necessary even after that:

- `CH-06` drag-from-port edge creation;
- `CH-07/08` direct frame manipulation and collision control.
