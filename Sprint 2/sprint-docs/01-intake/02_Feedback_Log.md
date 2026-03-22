# 02. Feedback Log

## Source Summary

- Primary source: `Sprint 2/Sprint 2 Comments.txt`
- Source type: customer post-release review
- Review date used for planning: `2026-03-19`
- Review context: walkthrough of the current MVP workspace after the first release

## Raw Feedback Records

| ID | Source | Normalized feedback record | Importance | Notes |
|---|---|---|---|---|
| FB-01 | Customer review | Project browser and workspace are shown on one screen; after opening a project, the browser part should disappear. | High | The customer explicitly asked for a two-step screen flow. |
| FB-02 | Customer review | The opened project workspace should use the whole screen and keep a way to return to project list. | High | This is paired with FB-01 but expresses the workspace-side expectation. |
| FB-03 | Customer review | The left panel should keep the project tree, but the new-model form should appear only on demand as a modal. | High | The customer likes the tree itself and dislikes the permanent form footprint. |
| FB-04 | Customer review | The center panel wastes too much space above the canvas; the canvas should visually dominate the workspace. | High | This is one of the strongest UX complaints in the review. |
| FB-05 | Customer review | The `Selection Card` with opened model / notation info should move out of the center panel and into the right properties panel. | Medium | This is tied directly to canvas expansion. |
| FB-06 | Customer review | Breadcrumbs and the `Current model context` area are too large and do not use width cleanly. | Medium | The customer explicitly called out large headers and awkward width usage. |
| FB-07 | Customer review | Creating edges through `Create outgoing edge` is inconvenient; edges should be created by dragging from node ports. | High | Existing edge deletion by selecting the edge is already acceptable. |
| FB-08 | Customer review | Frames should be movable and adjustable; dropping a node into a frame should give it membership in that frame. | High | The current membership-by-checkbox flow is too indirect. |
| FB-09 | Customer review | Nodes and frames currently overlap too freely; manual movement should be more constrained. | High | This includes frame-frame and node-node overlap complaints. |
| FB-10 | Customer review | Check text wrapping, button sizes, and overall layout so nothing spills out on a `1920x1080` screen. | Medium | This is a polish and regression expectation across the whole workspace. |

## Evidence Handling Notes

- The source record was conversational and often bundled multiple changes into one paragraph.
- The purpose of this file is to preserve the raw intent before decomposition.
- The next document, `03_Change_Register.md`, splits these records into atomic change-items suitable for analysis and backlog generation.
