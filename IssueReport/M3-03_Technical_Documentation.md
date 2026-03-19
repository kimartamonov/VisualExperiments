# M3-03 Technical Documentation

## Purpose

`M3-03` establishes the shared runtime navigation layer for cross-model movement in the workspace before drill-down and step-up product flows are implemented.

## Architectural Approach

- Keep navigation state runtime-only and independent from persisted model YAML.
- Reuse the existing `getModel` flow for all model openings instead of adding a separate navigation transport.
- Separate pure navigation logic from React UI by moving it into `src/shared/navigation.ts`.
- Let the React workspace own presentation, error messaging, and recovery behavior on top of that pure state contract.

## Contracts And Structures

### `NavigationTarget`

- `modelPath`: stable relative model path
- `modelName`: display label captured at the time the model is opened

### `NavigationState`

- `stack`: ordered previous models in the current runtime path
- `current`: currently opened model or `null`

### Navigation Operations

- `openNavigationTarget(...)`
  - `reset`: start a fresh path from the opened model
  - `push`: append the previous current model to history when moving to another one
  - `refresh`: update the current target metadata without duplicating breadcrumbs
- `navigateBack(...)`
  - returns the previous target and the truncated stack
- `navigateToBreadcrumb(...)`
  - returns a target from the existing breadcrumb path and truncates the stack to that point
- `dropNavigationTarget(...)`
  - removes a broken target from runtime state to preserve a valid recovery path

## Frontend Integration

### `src/client/App.tsx`

- Adds `navigationState` alongside the existing `currentModel`.
- Extends `openModel(...)` with navigation-aware options:
  - navigation mode
  - explicit next navigation state for back/breadcrumb jumps
  - failure mode for either clearing or preserving current workspace context
  - optional pruning of broken targets from runtime state
- Resets navigation cleanly when:
  - leaving the project route
  - opening a project without a default model
  - failing to open the default model

### UI Surfaces

- Workspace header:
  - current model context
  - breadcrumb trail
  - back action
- Center panel:
  - navigation depth summary
- Right panel:
  - current runtime navigation context and next back target

## Recovery Behavior

- If a navigation target cannot be opened, the app does not crash.
- For non-destructive failures, the current workspace remains active and the user gets a readable error message.
- For project bootstrap failures such as a broken default model, the model view is cleared while the project tree remains available for manual recovery.

## Build And Test Integration

- `scripts/build.mjs` now emits `src/shared/navigation.ts` to `dist/server/navigation.js` for test reuse.
- `test/navigation-runtime.test.mjs` covers pure runtime stack behavior.
- `test/navigation-context-validation.mjs` covers:
  - A -> B -> C navigation path
  - back navigation
  - breadcrumb jump
  - broken-target recovery via runtime pruning
  - absence of breadcrumb/back-stack persistence in YAML

## Limitations

- Navigation state is not persisted across a browser reload.
- Browser history is not used as the authoritative model-navigation mechanism.
- The issue does not create or infer drill-down or step-up links by itself.

## What The Next Issues Can Rely On

- A stable in-memory navigation stack is now available.
- Breadcrumb and back semantics no longer need to be reinvented per feature.
- `M3-04` and `M3-05` can focus on model creation/linking behavior while reusing this common navigation base.
