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

- Issue ID: `M2-02`
- Title: `Create and persist nodes in freeform models`
- Status: `Current`
- Milestone: `M2. Freeform Modeling Workspace`
- Issue File: `Issue-Tree/M2_Freeform_Modeling_Workspace/M2-02_Create_And_Persist_Nodes_In_Freeform_Models.md`
- Milestone README: `Issue-Tree/M2_Freeform_Modeling_Workspace/README.md`
- Depends On: `M2-01`
- Next Issue On Success: `M2-03`
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
| 7 | M2-02 | M2 | Current | - | - | Node editing |
| 8 | M2-03 | M2 | Pending | - | - | Edge editing |
| 9 | M2-04 | M2 | Pending | - | - | Frame semantic container |
| 10 | M2-05 | M2 | Pending | - | - | Freeform validation |
| 11 | M2-06 | M2 | Pending | - | - | Freeform blocker fixes |
| 12 | M3-01 | M3 | Pending | - | - | Step-up decision |
| 13 | M3-02 | M3 | Pending | - | - | Step-up spike |
| 14 | M3-03 | M3 | Pending | - | - | Breadcrumbs and back |
| 15 | M3-04 | M3 | Pending | - | - | Drill-down implementation |
| 16 | M3-05 | M3 | Pending | - | - | Step-up implementation |
| 17 | M3-06 | M3 | Pending | - | - | Multiple drill-down refinement |
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

---

## Latest Execution Note

- Completed `M2-01` on `2026-03-18`.
- Freeform model create/open lifecycle now works through backend YAML persistence and workspace UI.
- The first model can populate `defaultModel`, new model files appear in tree, and reopen preserves the empty freeform model.
- Next issue to execute is `M2-02`.
- Execution may continue without additional decisions; the next gap is node editing inside the now-open freeform model.
