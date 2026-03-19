# Issue Release Journal

## Purpose

Этот файл является журналом последовательной реализации `Issue-Tree/`.

Он нужен для того, чтобы:

- хранить, какой Issue сейчас активен;
- фиксировать, какие Issues уже завершены;
- хранить ссылки на отчеты и техдок;
- автоматически сдвигать выполнение вперед после каждого успешного прохода;
- позволять запускать реализацию одной и той же командой через `IssueExecutionCurrentTask.md`.

---

## Journal Rules

1. В каждый момент времени должен быть ровно один `Current Active Issue`.
2. Новый Issue нельзя назначать current, если его `Depends On` не закрыты.
3. После успешного завершения Issue он:
   - помечается как `Done`;
   - попадает в `Completed Issues`;
   - получает ссылки на отчет и техдок.
4. Если Issue не завершен, он не должен быть автоматически заменен следующим.
5. Если найден блокер, он фиксируется в `Latest Execution Note`, а текущий Issue остается активным.

---

## Current Active Issue

- Issue ID: `M3-06`
- Title: `Add multiple drill-down support`
- Status: `Current`
- Milestone: `M3. Hierarchy and Semantic Navigation`
- Issue File: `Issue-Tree/M3_Hierarchy_and_Semantic_Navigation/M3-06_Add_Multiple_DrillDown_Support.md`
- Milestone README: `Issue-Tree/M3_Hierarchy_and_Semantic_Navigation/README.md`
- Depends On: `M3-04`
- Next Issue On Success: `M3-07`
- Blockers: `None`

---

## Execution Queue

| Order | Issue ID | Milestone | Status | Report | Tech Doc | Notes |
|---|---|---|---|---|---|---|
| 1 | M1-01 | M1 | Done | `IssueReport/M1-01_Implementation_Report.md` | `IssueReport/M1-01_Technical_Documentation.md` | Manifest v1 and file placement contract fixed |
| 2 | M1-02 | M1 | Done | `IssueReport/M1-02_Implementation_Report.md` | `IssueReport/M1-02_Technical_Documentation.md` | Working create/open project flow with manifest bootstrap and workspace context |
| 3 | M1-03 | M1 | Done | `IssueReport/M1-03_Implementation_Report.md` | `IssueReport/M1-03_Technical_Documentation.md` | Three-panel shell and real file tree API/rendering are now stable |
| 4 | M1-04 | M1 | Done | `IssueReport/M1-04_Implementation_Report.md` | `IssueReport/M1-04_Technical_Documentation.md` | Validation pass completed; no critical/high findings observed |
| 5 | M1-05 | M1 | Done | `IssueReport/M1-05_Implementation_Report.md` | `IssueReport/M1-05_Technical_Documentation.md` | Bugfix slot closed with empty blocker-list; no foundation fixes were required |
| 6 | M2-01 | M2 | Done | `IssueReport/M2-01_Implementation_Report.md` | `IssueReport/M2-01_Technical_Documentation.md` | Freeform model create/open flow and empty canvas bootstrap are now stable |
| 7 | M2-02 | M2 | Done | `IssueReport/M2-02_Implementation_Report.md` | `IssueReport/M2-02_Technical_Documentation.md` | Node lifecycle now works through canvas UI and YAML persistence |
| 8 | M2-03 | M2 | Done | `IssueReport/M2-03_Implementation_Report.md` | `IssueReport/M2-03_Technical_Documentation.md` | Directed edge create/delete and canvas arrow rendering are now stable |
| 9 | M2-04 | M2 | Done | `IssueReport/M2-04_Implementation_Report.md` | `IssueReport/M2-04_Technical_Documentation.md` | Frame semantic containers and membership persistence are now stable |
| 10 | M2-05 | M2 | Done | `IssueReport/M2-05_Implementation_Report.md` | `IssueReport/M2-05_Technical_Documentation.md` | Freeform validation passed; blocker-list is empty |
| 11 | M2-06 | M2 | Done | `IssueReport/M2-06_Implementation_Report.md` | `IssueReport/M2-06_Technical_Documentation.md` | Bugfix slot closed with empty blocker-list; no freeform fixes were required |
| 12 | M3-01 | M3 | Done | `IssueReport/M3-01_Implementation_Report.md` | `IssueReport/M3-01_Technical_Documentation.md` | Step-up synchronization semantics fixed for MVP; no live sync and explicit manual regenerate contract accepted |
| 13 | M3-02 | M3 | Done | `IssueReport/M3-02_Implementation_Report.md` | `IssueReport/M3-02_Technical_Documentation.md` | Step-up spike proved create/open-existing/manual-regenerate path and preserved canonical stepUp link contract |
| 14 | M3-03 | M3 | Done | `IssueReport/M3-03_Implementation_Report.md` | `IssueReport/M3-03_Technical_Documentation.md` | Runtime navigation stack, breadcrumbs, back action, and recovery path are now stable |
| 15 | M3-04 | M3 | Done | `IssueReport/M3-04_Implementation_Report.md` | `IssueReport/M3-04_Technical_Documentation.md` | Single drill-down create/link/open/return flow and broken-link recovery are now stable |
| 16 | M3-05 | M3 | Done | `IssueReport/M3-05_Implementation_Report.md` | `IssueReport/M3-05_Technical_Documentation.md` | Production frame step-up flow, regenerate contract, and upper-level navigation are now stable |
| 17 | M3-06 | M3 | Current | - | - | Multiple drill-down refinement |
| 18 | M3-07 | M3 | Pending | - | - | Navigation validation |
| 19 | M3-08 | M3 | Pending | - | - | Navigation blocker fixes |
| 20 | M4-01 | M4 | Pending | - | - | Late typing |
| 21 | M4-02 | M4 | Pending | - | - | Notation extraction |
| 22 | M4-03 | M4 | Pending | - | - | Typed model creation |
| 23 | M4-04 | M4 | Pending | - | - | Typing/notation validation |
| 24 | M4-05 | M4 | Pending | - | - | Typing/notation blocker fixes |
| 25 | M5-01 | M5 | Pending | - | - | Save and round-trip integrity |
| 26 | M5-02 | M5 | Pending | - | - | Error handling and recovery |
| 27 | M5-03 | M5 | Pending | - | - | Persistence/recovery validation |
| 28 | M5-04 | M5 | Pending | - | - | Full 14-step acceptance |
| 29 | M5-05 | M5 | Pending | - | - | Final blocker fixes |

---

## Completed Issues

| Completed On | Issue ID | Milestone | Report | Tech Doc | Notes |
|---|---|---|---|---|---|
| 2026-03-18 | M1-01 | M1 | `IssueReport/M1-01_Implementation_Report.md` | `IssueReport/M1-01_Technical_Documentation.md` | Fixed manifest v1, root-relative path rules, and unblocked M1-02/M2-01/M3-04/M3-05 |
| 2026-03-18 | M1-02 | M1 | `IssueReport/M1-02_Implementation_Report.md` | `IssueReport/M1-02_Technical_Documentation.md` | Implemented backend/frontend create-open project flow and unblocked M1-03/M2-01 |
| 2026-03-18 | M1-03 | M1 | `IssueReport/M1-03_Implementation_Report.md` | `IssueReport/M1-03_Technical_Documentation.md` | Added file-tree API, three-panel shell, and tree refresh path for later model flows |
| 2026-03-18 | M1-04 | M1 | `IssueReport/M1-04_Implementation_Report.md` | `IssueReport/M1-04_Technical_Documentation.md` | Validation passed for steps 1-2 and AC-1/AC-2; no critical/high blockers were found |
| 2026-03-18 | M1-05 | M1 | `IssueReport/M1-05_Implementation_Report.md` | `IssueReport/M1-05_Technical_Documentation.md` | Bugfix gate confirmed no blocker fixes were needed and unlocked M2-01 |
| 2026-03-18 | M2-01 | M2 | `IssueReport/M2-01_Implementation_Report.md` | `IssueReport/M2-01_Technical_Documentation.md` | Implemented freeform model create/open lifecycle, defaultModel update, and empty canvas bootstrap |
| 2026-03-18 | M2-02 | M2 | `IssueReport/M2-02_Implementation_Report.md` | `IssueReport/M2-02_Technical_Documentation.md` | Implemented persisted node create/move/edit/delete flow and unlocked edge and frame slices |
| 2026-03-18 | M2-03 | М2 | `IssueReport/M2-03_Implementation_Report.md` | `IssueReport/M2-03_Technical_Documentation.md` | Implemented directed edge create/delete flow, YAML persistence, and canvas arrow rendering |
| 2026-03-18 | M2-04 | M2 | `IssueReport/M2-04_Implementation_Report.md` | `IssueReport/M2-04_Technical_Documentation.md` | Implemented frames as semantic containers with persisted membership, metadata, and safe deletion |
| 2026-03-18 | M2-05 | M2 | `IssueReport/M2-05_Implementation_Report.md` | `IssueReport/M2-05_Technical_Documentation.md` | Validation passed for AC-3..AC-6 and demo steps 3-5; no critical/high blockers were found |
| 2026-03-18 | M2-06 | M2 | `IssueReport/M2-06_Implementation_Report.md` | `IssueReport/M2-06_Technical_Documentation.md` | Bugfix gate confirmed no blocker fixes were needed and unlocked M3-01 |
| 2026-03-18 | M3-01 | M3 | `IssueReport/M3-01_Implementation_Report.md` | `IssueReport/M3-01_Technical_Documentation.md` | Closed DB-17 for MVP: first step-up creates canonical link, repeats reuse existing target, and regeneration stays explicit |
| 2026-03-19 | M3-02 | M3 | `IssueReport/M3-02_Implementation_Report.md` | `IssueReport/M3-02_Technical_Documentation.md` | Proved create/open-existing/manual-regenerate step-up path, preserved canonical stepUp link semantics, and unblocked M3-03/M3-05 |
| 2026-03-19 | M3-03 | M3 | `IssueReport/M3-03_Implementation_Report.md` | `IssueReport/M3-03_Technical_Documentation.md` | Implemented runtime navigation stack, breadcrumbs, back recovery path, and unblocked M3-04/M3-05 |
| 2026-03-19 | M3-04 | M3 | `IssueReport/M3-04_Implementation_Report.md` | `IssueReport/M3-04_Technical_Documentation.md` | Implemented persisted `Node.drilldowns[]`, single drill-down create/link/open/return flow, and unblocked M3-05/M3-06 |
| 2026-03-19 | M3-05 | M3 | `IssueReport/M3-05_Implementation_Report.md` | `IssueReport/M3-05_Technical_Documentation.md` | Implemented production frame step-up create or reuse flow, explicit regenerate recovery, and upper-level navigation over the shared M3-03 context |

---

## Latest Execution Note

- Completed `M3-05` on `2026-03-19`.
- Implemented production frame step-up with canonical `default` and `regenerate` modes, `models/abstractions/` placement, persisted `frame.stepUp`, and frame-properties UI actions for create/open/rebuild.
- Added broken-target recovery through explicit regenerate and kept upper-level navigation on the shared M3-03 breadcrumbs/back runtime without introducing live sync.
- Local checks passed: `npm.cmd run check`, `npm.cmd run build`, `npm.cmd test`, `npm.cmd run validate:m1`, `npm.cmd run validate:m2`, `npm.cmd run validate:m3:spike`, `npm.cmd run validate:m3:navigation`, `npm.cmd run validate:m3:drilldown`, `npm.cmd run validate:m3:stepup`.
- Next issue to execute is `M3-06`.
