# Issue Execution Prompt

## Recommended Operating Mode

Для этого репозитория рекомендуется режим **single-command execution**:

- один и тот же запуск каждый раз начинается с `IssueExecutionCurrentTask.md`;
- сам промт берет текущий активный Issue из `IssueReleaseJournal.md`;
- после завершения обновляет журнал;
- следующий запуск снова использует тот же файл `IssueExecutionCurrentTask.md`.

Это лучше, чем вручную каждый раз переписывать `M1-01`, `M1-02`, `M1-03` и так далее.

---

## Core Files

- `IssueExecutionCurrentTask.md`
  Универсальный исполняющий промт. Его можно вызывать каждый раз одной и той же командой.

- `IssueReleaseJournal.md`
  Журнал состояния релизной последовательности. В нем хранится:
  - какой Issue сейчас активен;
  - какие Issues уже завершены;
  - где лежат отчеты;
  - какой следующий Issue должен стать текущим после успешного завершения.

- `Issue-Tree/`
  Основной source of truth по структуре roadmap, milestone, dependencies и деталям каждого Issue.

- `IssueReport/`
  Папка для отчетов реализации и техдокументации по каждому завершенному Issue.

---

## Recommended Workflow

Каждый цикл работы выглядит так:

1. Запускать исполнение через `IssueExecutionCurrentTask.md`.
2. Исполнитель читает `IssueReleaseJournal.md`.
3. Исполнитель определяет текущий активный Issue.
4. Исполнитель реализует только этот Issue.
5. Исполнитель создает:
   - отчет реализации;
   - техническую документацию;
   - обновление в `IssueReleaseJournal.md`.
6. Если Issue завершен успешно:
   - он попадает в список completed;
   - следующий pending Issue становится current.
7. Если Issue заблокирован:
   - текущий Issue остается current;
   - журнал фиксирует блокер;
   - цепочка не сдвигается вперед.

---

## Why Issue-By-Issue Is Still The Best Default

Даже при single-command режиме стратегия остается **один запуск = один Issue**.

Почему:

- `Issue-Tree/` уже построен как последовательная dependency chain;
- у каждого Issue есть собственные `Scope`, `Required Tests`, `Handoff to Next Issue` и `Done Definition`;
- так проще избегать scope creep;
- так проще поддерживать журнал в точном состоянии;
- это лучше подходит для AI-исполнителя, чем большой milestone-пакет.

Milestone-level execution можно использовать только отдельно и осознанно, но не как основной режим.

---

## What The Universal Prompt Must Always Do

Независимо от конкретного Issue, `IssueExecutionCurrentTask.md` должен требовать от исполнителя:

1. Прочитать:
   - `IssueReleaseJournal.md`
   - `Issue-Tree/00_Master_Roadmap.md`
   - `Issue-Tree/01_Milestone_Index.md`
   - `Issue-Tree/02_Dependency_Map.md`
   - `Issue-Tree/03_Traceability_Matrix.md`
   - milestone `README.md`
   - issue-файл текущего Issue

2. Проверить:
   - что все `Depends On` уже завершены;
   - что текущий Issue действительно разрешен к старту;
   - что нет явного блокера в журнале.

3. Реализовать:
   - только текущий Issue;
   - строго в пределах `Goal`, `Scope`, `Out of Scope`, `Implementation Notes`, `Acceptance Criteria for This Issue`, `Required Tests`, `Handoff to Next Issue` и `Done Definition`.

4. После реализации:
   - выполнить проверки из `Required Tests`;
   - создать отчет;
   - создать техдок;
   - обновить журнал.

5. При обновлении журнала:
   - отметить текущий Issue как `Done`, если он реально завершен;
   - записать пути к отчету и техдоку;
   - перенести Issue в completed section;
   - назначить следующий Issue как current;
   - если есть блокер, не переключать current Issue, а записать его как `Blocked`.

---

## Naming Convention For Reports

- `IssueReport/{ISSUE_ID}_Implementation_Report.md`
- `IssueReport/{ISSUE_ID}_Technical_Documentation.md`

Примеры:

- `IssueReport/M1-01_Implementation_Report.md`
- `IssueReport/M1-01_Technical_Documentation.md`

---

## Short Operator Command

Практически использовать это теперь лучше так:

```md
Реализуй `IssueExecutionCurrentTask.md`
```

Или:

```md
Исполни задачу из `IssueExecutionCurrentTask.md`
```

Этого достаточно, потому что сам файл уже будет направлять исполнителя на текущий active Issue через `IssueReleaseJournal.md`.

---

## When To Manually Override The Flow

Ручное указание конкретного Issue все еще допустимо, если:

- нужно повторно открыть незавершенный или спорный Issue;
- нужно пропустить к следующему Issue только после явного решения человека;
- требуется целевой review уже реализованного Issue;
- нужно пересобрать журнал вручную после внеплановых изменений.

Но в обычной работе лучше использовать только:

- `IssueExecutionCurrentTask.md`
- `IssueReleaseJournal.md`

---

## Recommended Rule For This Repository

Основное правило:

> Один и тот же стартовый промт используется каждый раз, а выбор следующего Issue определяется и обновляется внутри `IssueReleaseJournal.md`.

Именно этот режим теперь следует считать основным.
