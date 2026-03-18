# IssueReleaseJournal Init Prompt

Используй этот промт, когда нужно **с нуля сгенерировать исходный `IssueReleaseJournal.md`**, опираясь только на уже существующую структуру `Issue-Tree/`.

## Main Task

Используя файловую структуру `Issue-Tree/`, создай **начальную версию** файла:

- `IssueReleaseJournal.md`

Создавай именно журнал состояния выполнения, а не реализацию Issues.

---

## Source Of Truth

Считай единственным источником истины:

- `Issue-Tree/00_Master_Roadmap.md`
- `Issue-Tree/01_Milestone_Index.md`
- `Issue-Tree/02_Dependency_Map.md`
- `Issue-Tree/03_Traceability_Matrix.md`
- все milestone `README.md`
- все issue-файлы внутри `Issue-Tree/`

Не используй внешние предположения, если их нет в `Issue-Tree/`.

---

## What Must Be Produced

Нужно создать **исходный** `IssueReleaseJournal.md`, в котором:

1. Есть краткое назначение журнала.
2. Есть правила ведения журнала.
3. Есть раздел `Current Active Issue`.
4. Есть раздел `Execution Queue`.
5. Есть раздел `Completed Issues`.
6. Есть раздел `Latest Execution Note`.

---

## How To Build The Initial Journal

### 1. Determine The Full Execution Order

Сначала восстанови полный порядок выполнения Issues:

- используй `01_Milestone_Index.md`;
- сверь последовательность через `02_Dependency_Map.md`;
- при необходимости уточни порядок по именам файлов и полям metadata в самих issue-файлах.

Журнал должен отражать **единый основной порядок выполнения**, а не абстрактный список.

### 2. Determine The First Active Issue

Определи самый первый Issue, который должен стать текущим.

Обычно это первый Issue в общей последовательности, у которого:

- нет незакрытых зависимостей;
- он находится в самом начале execution path;
- его можно стартовать без предварительной реализации другого Issue.

Именно этот Issue должен быть записан в `Current Active Issue` со статусом:

- `Current`

### 3. Build The Queue

В `Execution Queue` включи **все Issues** из `Issue-Tree/` по порядку выполнения.

Для каждого Issue укажи:

- порядок;
- `Issue ID`;
- `Milestone`;
- `Status`;
- `Report`;
- `Tech Doc`;
- краткую заметку.

Правила статусов для начального журнала:

- первый исполняемый Issue = `Current`
- все остальные = `Pending`

### 4. Initialize Completed Section

Так как это начальная версия журнала, раздел `Completed Issues` должен быть пустым, но оформленным как таблица с одной строкой-заглушкой, например:

- `No completed issues yet`

### 5. Initialize Latest Execution Note

В `Latest Execution Note` нужно зафиксировать:

- что журнал только что инициализирован;
- какой Issue выбран текущим;
- какой Issue должен идти следующим после него при успешном завершении;
- что при блокере текущий Issue должен остаться активным.

---

## Required Journal Structure

Сгенерированный `IssueReleaseJournal.md` должен содержать как минимум следующие разделы:

```md
# Issue Release Journal

## Purpose

## Journal Rules

## Current Active Issue

## Execution Queue

## Completed Issues

## Latest Execution Note
```

---

## Rules For Content

1. Не отмечай никакие Issues как `Done`, если это начальная генерация журнала.
2. Не создавай фиктивные отчеты и техдоки.
3. Не пропускай ни один Issue из `Issue-Tree/`.
4. Не меняй порядок выполнения, если он уже задан в milestone index и dependency map.
5. Не пытайся реализовывать сами Issues.
6. Не добавляй в журнал post-MVP задачи, которых нет в `Issue-Tree/`.

---

## Expected Output Rules

После генерации:

- создай или перезапиши `IssueReleaseJournal.md`;
- не создавай implementation reports;
- не создавай technical documentation;
- не обновляй код проекта;
- не помечай progress, кроме начального `Current` для первого Issue.

---

## Final Response Format

В финальном ответе кратко сообщи:

- что `IssueReleaseJournal.md` создан;
- какой Issue назначен текущим;
- сколько всего Issues попало в очередь;
- какой Issue будет следующим после текущего при успешном завершении.

---

## Ready-To-Use Prompt

Ниже короткая версия этого же промта для прямого запуска:

```md
Используя только структуру `Issue-Tree/`, создай исходный `IssueReleaseJournal.md`.

Считай источником истины:
- `Issue-Tree/00_Master_Roadmap.md`
- `Issue-Tree/01_Milestone_Index.md`
- `Issue-Tree/02_Dependency_Map.md`
- `Issue-Tree/03_Traceability_Matrix.md`
- все milestone README
- все issue-файлы

В журнале обязательно создай разделы:
- `Purpose`
- `Journal Rules`
- `Current Active Issue`
- `Execution Queue`
- `Completed Issues`
- `Latest Execution Note`

Определи полный порядок Issues, назначь первый исполняемый Issue как `Current`, все остальные поставь как `Pending`, раздел `Completed Issues` оставь пустым, а в `Latest Execution Note` зафиксируй, что журнал инициализирован и какой Issue должен быть следующим после текущего.

Не реализуй сами Issues. Не создавай отчеты реализации. Не создавай техдок. Создай только исходный `IssueReleaseJournal.md`.
```
