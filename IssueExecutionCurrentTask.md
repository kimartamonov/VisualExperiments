# Issue Execution Current Task

Используй этот файл как **универсальный стартовый промт** для каждого нового прохода реализации.

## Main Instruction

Используй `IssueReleaseJournal.md` как источник истины для определения **текущего активного Issue**, который нужно реализовать прямо сейчас.

Не проси пользователя заново указывать `M1-01`, `M1-02`, `M2-01` и так далее, если это уже отражено в журнале.

---

## Files You Must Read Before Implementation

Обязательно прочитай:

- `IssueReleaseJournal.md`
- `Issue-Tree/00_Master_Roadmap.md`
- `Issue-Tree/01_Milestone_Index.md`
- `Issue-Tree/02_Dependency_Map.md`
- `Issue-Tree/03_Traceability_Matrix.md`

После этого найди в `IssueReleaseJournal.md`:

- какой Issue помечен как `Current`;
- где лежит issue-файл;
- где лежит milestone `README.md`;
- есть ли уже зафиксированные blockers по текущей задаче.

Затем обязательно прочитай:

- milestone `README.md` для текущего Issue;
- markdown-файл самого текущего Issue.

---

## How To Determine The Work Item

1. Найди раздел `Current Active Issue` в `IssueReleaseJournal.md`.
2. Возьми оттуда:
   - `Issue ID`
   - `Milestone`
   - `Issue File`
   - `Status`
3. Если статус:
   - `Current` или `Ready` — приступай к реализации;
   - `Blocked` — не переходи к следующему Issue автоматически, сначала опиши блокер и работай только в рамках разблокировки, если это прямо указано;
   - `Done` — это ошибка журнала; найди следующий `Pending` только если в журнале явно указано, что current должен быть сдвинут.

---

## Execution Rules

Работай строго по следующим правилам:

1. Проверь, что все `Depends On` текущего Issue уже завершены и отражены в `IssueReleaseJournal.md`.
2. Реализуй только текущий Issue.
3. Не захватывай scope следующих Issues.
4. Не добавляй post-MVP функциональность.
5. Если в ходе работы обнаружится незакрытое архитектурное или продуктовое решение, не придумывай его скрыто, а зафиксируй блокер.
6. Опирайся на разделы текущего Issue:
   - `Goal`
   - `Why Now`
   - `Scope`
   - `Out of Scope`
   - `Preconditions`
   - `Implementation Notes`
   - `Acceptance Criteria for This Issue`
   - `Required Tests`
   - `Handoff to Next Issue`
   - `Done Definition`

---

## Required Deliverables After Implementation

После реализации обязательно создай:

- `IssueReport/{ISSUE_ID}_Implementation_Report.md`
- `IssueReport/{ISSUE_ID}_Technical_Documentation.md`

### Implementation Report Must Include

- какой Issue реализован;
- что реально сделано;
- какие файлы изменены;
- какие acceptance criteria закрыты;
- какие проверки выполнены;
- что осталось вне scope;
- какие риски остались;
- что теперь разблокировано.

### Technical Documentation Must Include

- назначение реализованного участка;
- архитектурный подход;
- затронутые контракты и структуры данных;
- ключевую логику;
- ограничения;
- точки интеграции;
- на что теперь может опираться следующий Issue.

---

## Required Journal Update

После завершения работы обязательно обнови `IssueReleaseJournal.md`.

### If The Issue Is Successfully Completed

Сделай все сразу:

1. Обнови `Current Active Issue`:
   - текущий Issue больше не должен оставаться current;
   - следующим current должен стать следующий Issue по очереди, если он действительно разблокирован.

2. Обнови `Execution Queue`:
   - текущий Issue переведи в статус `Done`;
   - следующему Issue присвой статус `Current`.

3. Обнови `Completed Issues`:
   - добавь запись о завершенном Issue;
   - укажи путь к implementation report;
   - укажи путь к technical documentation;
   - укажи дату завершения;
   - кратко укажи, что разблокировано.

4. Обнови `Latest Execution Note`:
   - что было завершено;
   - какой следующий Issue теперь должен реализовываться;
   - можно ли продолжать без дополнительных решений.

### If The Issue Is Not Completed

Тогда:

1. Не переключай current Issue на следующий.
2. Оставь тот же Issue активным.
3. Поставь ему статус `Blocked` или `In Progress`, смотря по ситуации.
4. В `Latest Execution Note` запиши:
   - что помешало завершению;
   - какие именно blockers найдены;
   - какой следующий шаг нужен для разблокировки.

---

## How To Choose The Next Issue

Если текущий Issue завершен успешно, следующий Issue выбирается так:

1. Смотри `Handoff to Next Issue` в текущем issue-файле.
2. Сверь это с:
   - `Issue-Tree/01_Milestone_Index.md`
   - `Issue-Tree/02_Dependency_Map.md`
   - `IssueReleaseJournal.md`
3. Следующим current становится:
   - первый следующий Issue в очереди,
   - у которого все зависимости уже закрыты,
   - и который не находится в blocked state.

Если следующий Issue нельзя безопасно запускать, не назначай его current без пояснения. Зафиксируй причину в журнале.

---

## Final Response Format

В конце обязательно кратко сообщи:

- какой Issue был взят из `IssueReleaseJournal.md`;
- завершен ли он;
- какие ключевые файлы изменены;
- где лежит отчет;
- где лежит техническая документация;
- какой Issue теперь записан следующим в `IssueReleaseJournal.md`.

---

## One-Line User Invocation

Этот файл специально сделан так, чтобы его можно было запускать одной командой:

```md
Реализуй `IssueExecutionCurrentTask.md`
```

или

```md
Исполни задачу из `IssueExecutionCurrentTask.md`
```
