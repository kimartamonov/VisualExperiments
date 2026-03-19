# M3-05 Technical Documentation

## Purpose

`M3-05` turns the earlier step-up spike into a production MVP flow: a frame can create or reopen an upper-level model, persist a canonical `frame.stepUp` link, navigate into that target model, and explicitly regenerate its representative node without enabling live synchronization.

## Architecture

- `ProjectService.stepUpFrame()` is the backend entry point for frame step-up operations.
- The backend owns placement, representative-node generation, persistence of `frame.stepUp`, and regenerate-time recovery when the upper-level file is missing.
- `POST /api/projects/:projectId/frames/:frameId/step-up` exposes the flow to the client with `mode: "default" | "regenerate"`.
- The React workspace consumes that API from the frame properties panel and reuses the shared navigation runtime from `M3-03`.

## Contracts And Data

- `FrameStepUpMode = "default" | "regenerate"` defines the operational intent.
- `FrameStepUpResult` returns:
  - updated `sourceModel`
  - resolved `upperModel`
  - canonical `link`
  - `created`
  - `regenerated`
- `ModelFrame.stepUp` remains the persisted source-of-truth link:
  - `model`: upper-level model path
  - `nodeId`: representative node id inside that model

## Core Logic

- First default step-up:
  - creates `models/abstractions/<slug>.yaml`
  - creates one representative node
  - persists `frame.stepUp`
- Repeated default step-up:
  - reuses the stored link
  - opens the existing upper-level model
  - does not regenerate or duplicate the representative node
- Explicit regenerate:
  - updates the representative node in place when the target exists
  - recreates the file or node if the target was lost
  - keeps the same canonical `frame.stepUp` link

## UI Integration

- The frame properties panel now shows:
  - current step-up link state
  - `Step up`
  - `Open upper level`
  - `Regenerate`
  - recovery CTA when the linked target is missing
- Opening the upper-level model uses the existing breadcrumb/back stack instead of adding YAML-persisted navigation metadata.

## Limitations

- Regenerate is intentionally destructive for the representative node content because the contract is explicit refresh, not merge.
- No live sync is performed after step-up creation.
- Recovery currently focuses on rebuild-in-place rather than path reassignment or model chooser flows.

## Integration Points For Next Issue

- `M3-06` can build on a stable hierarchy contract where:
  - frame step-up links persist reliably
  - navigation between models is already integrated
  - broken targets can be recovered without breaking workspace state
- `M3-07` can use `validate:m3:stepup` as the hierarchy acceptance baseline for upper-level navigation.
