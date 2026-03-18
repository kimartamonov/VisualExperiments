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

- Issue ID: `M1-01`
- Title: `Finalize project manifest and file placement contract`
- Status: `Current`
- Milestone: `M1. Project Foundation`
- Issue File: `Issue-Tree/M1_Project_Foundation/M1-01_Finalize_Project_Manifest_And_File_Placement.md`
- Milestone README: `Issue-Tree/M1_Project_Foundation/README.md`
- Depends On: `None`
- Next Issue On Success: `M1-02`
- Blockers: `None`

---

## Execution Queue

| Order | Issue ID | Milestone | Status | Report | Tech Doc | Notes |
|---|---|---|---|---|---|---|
| 1 | M1-01 | M1 | Current | - | - | Planning gate for manifest and file placement |
| 2 | M1-02 | M1 | Pending | - | - | Project bootstrap create/open |
| 3 | M1-03 | M1 | Pending | - | - | Workspace shell and project tree |
| 4 | M1-04 | M1 | Pending | - | - | Foundation validation |
| 5 | M1-05 | M1 | Pending | - | - | Foundation blocker fixes |
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
| - | - | - | - | - | No completed issues yet |

---

## Latest Execution Note

- Journal initialized.
- Current execution should start from `M1-01`.
- After successful completion of `M1-01`, the journal should advance to `M1-02`.
- If `M1-01` cannot be completed, it must remain current and the blocker must be recorded here.
