# 08. Decisions, Open Questions, and Deferments

## Working Decisions Accepted For Planning

### D2-01. Sprint 2 is a UX and interaction pass, not a new MVP definition

- Status: `Accepted`
- Consequence:
  - existing core feature set stays intact;
  - planning focuses on delta, not full product redesign.

### D2-02. Browser and workspace become separate screens

- Status: `Accepted`
- Consequence:
  - the side-by-side root layout is intentionally abandoned for the active project flow.

### D2-03. Model creation becomes an on-demand modal

- Status: `Accepted`
- Consequence:
  - left-panel navigation becomes denser and simpler.

### D2-04. Opened-model summary moves to the right panel

- Status: `Accepted`
- Consequence:
  - the center panel stops spending premium canvas space on model metadata.

### D2-05. Drag-from-port becomes the primary edge-creation path

- Status: `Accepted`
- Consequence:
  - the old `Create outgoing edge` button should not remain the main happy path.

### D2-06. Frame containment semantics stay minimal in Sprint 2

- Status: `Accepted`
- Assumption:
  - if a node is dropped into a frame, the node joins `frame.nodeIds`;
  - no new semantic edge or extra domain relation is introduced.

### D2-07. Existing hierarchy, typing, and recovery flows are protected from regression

- Status: `Accepted`
- Consequence:
  - any Sprint 2 issue that regresses drill-down, step-up, notation, save, or recovery is incomplete.

## Planning Assumptions Used To Unblock Backlog Generation

### A2-01. Frames will get persisted geometry

- Status: `Planning assumption`
- Why:
  - direct frame move and resize are otherwise inconsistent with the current derived-bounds model.
- Expected schema direction:
  - explicit frame position and size fields in persisted model data.

### A2-02. Collision policy will use hard-stop at the last valid position

- Status: `Planning assumption`
- Why:
  - this is the simplest deterministic behavior that satisfies the customer's request without introducing a layout engine.

### A2-03. Port visibility should be contextual, not permanently noisy

- Status: `Planning assumption`
- Recommendation:
  - show ports on hover, focus, or selection rather than as always-on large controls.

## Open Questions

### Q2-01. Should dragging a node out of a frame automatically remove membership?

- Status: `Open but non-blocking`
- Recommended Sprint 2 stance:
  - not required as a hard rule for the first implementation;
  - explicit add-on-drop is more important than full bidirectional membership automation.

### Q2-02. Should node-frame collision be constrained when the node is intentionally entering the frame?

- Status: `Open but non-blocking`
- Recommended Sprint 2 stance:
  - allow intentional node placement inside frames;
  - collision rules should target node-node and frame-frame overlap first.

### Q2-03. Should the old edge button stay as a fallback affordance?

- Status: `Open but low priority`
- Recommended Sprint 2 stance:
  - it may remain temporarily for safety during transition, but should no longer define the main interaction path.

## Explicit Deferments

### DEF-01. Nested frames

- Status: `Deferred`
- Reason:
  - not requested directly and would complicate containment plus collision semantics.

### DEF-02. Automatic tidy layout / packing

- Status: `Deferred`
- Reason:
  - customer asked for overlap prevention, not for full auto-layout.

### DEF-03. Edge labels and typed edges

- Status: `Deferred`
- Reason:
  - unrelated to the current sprint goals.

### DEF-04. Mobile or tablet adaptation

- Status: `Deferred`
- Reason:
  - current brief still targets desktop usage.

### DEF-05. Step-up semantic redesign based on frame containment

- Status: `Deferred`
- Reason:
  - Sprint 2 should improve usability without reopening the whole hierarchy domain model.

## Ready-For-Backlog Conclusion

No blocking decision gaps remain for backlog generation.

The backlog can proceed under these planning assumptions:

- separate screens;
- modal model creation;
- compact breadcrumb/context presentation;
- drag-from-port edge creation;
- persisted frame geometry;
- hard-stop collision policy;
- regression protection for existing MVP flows.
