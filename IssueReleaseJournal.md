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

- Issue ID: `M1-05`
- Title: `Fix project foundation blockers`
- Status: `Current`
- Milestone: `M1. Project Foundation`
- Issue File: `Issue-Tree/M1_Project_Foundation/M1-05_Fix_Project_Foundation_Blockers.md`
- Milestone README: `Issue-Tree/M1_Project_Foundation/README.md`
- Depends On: `M1-04`
- Next Issue On Success: `M2-01`
- Blockers: `None`

---

## Execution Queue

| Order | Issue ID | Milestone | Status | Report | Tech Doc | Notes |
|---|---|---|---|---|---|---|
| 1 | M1-01 | M1 | Done | `IssueReport/M1-01_Implementation_Report.md` | `IssueReport/M1-01_Technical_Documentation.md` | Manifest v1 and file placement contract fixed |
| 2 | M1-02 | M1 | Done | `IssueReport/M1-02_Implementation_Report.md` | `IssueReport/M1-02_Technical_Documentation.md` | Working create/open project flow with manifest bootstrap and workspace context |
| 3 | M1-03 | M1 | Done | `IssueReport/M1-03_Implementation_Report.md` | `IssueReport/M1-03_Technical_Documentation.md` | Three-panel shell and real file tree API/rendering are now stable |
| 4 | M1-04 | M1 | Done | `IssueReport/M1-04_Implementation_Report.md` | `IssueReport/M1-04_Technical_Documentation.md` | Validation pass completed; no critical/high findings observed |
| 5 | M1-05 | M1 | Current | - | - | Foundation blocker fixes |
| 6 | M2-01 | M2 | Pending | - | - | Create freeform model |
| 7 | M2-02 | M2 | Pending | - | - | Node editing |
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

---

## Latest Execution Note

- Completed `M1-04` on `2026-03-18`.
- AC-1 and AC-2, plus demo steps 1-2, passed in the validation harness and supporting checks.
- No critical/high blockers were found in the current foundation validation pass.
- Next issue to execute is `M1-05`.
- Execution may continue without additional planning decisions; the bugfix slot now exists mainly to confirm that no foundation blockers remain before `M2-01`.
