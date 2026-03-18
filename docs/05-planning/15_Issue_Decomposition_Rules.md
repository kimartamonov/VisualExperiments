# 15. Issue Decomposition Rules

## Назначение документа

Этот документ задает правила, по которым capability slices превращаются в **дерево последовательных Issues**.

Цель документа:

- сделать декомпозицию воспроизводимой для человека и AI;
- удержать backlog в форме последовательного roadmap, а не плоского списка тем;
- задать единый формат issue, чтобы milestone можно было собирать и проверять системно;
- предотвратить типичные ошибки: слишком большие issues, смешение product decisions и implementation, отсутствие зависимости от acceptance.

---

## Входы для декомпозиции

Перед созданием issues должны использоваться следующие источники:

1. `Functional Requirements`
2. `Acceptance Criteria and Test Strategy`
3. `Roadmap and Delivery Plan`
4. `Risks, Decisions, Open Questions`
5. `Decision Backlog`
6. `Capability Slice Map`

Если issue не может быть обоснован хотя бы одним из этих источников, он не должен попадать в основной roadmap.

---

## Цель backlog

Backlog должен давать ответ на три вопроса:

1. Что именно делаем следующим шагом.
2. Почему именно это идет сейчас, а не позже.
3. Как понять, что шаг действительно завершен.

Поэтому issues должны быть:

- последовательными;
- зависимостными;
- проверяемыми;
- привязанными к product outcome, а не только к слою кода.

---

## Базовые принципы декомпозиции

### R1. Один issue = один проверяемый инкремент

Issue должен завершаться результатом, который можно принять локально: решение принято, API работает, конкретная capability доступна, acceptance fragment проходит.

### R2. Не смешивать decision и implementation

Если исход задачи зависит от выбора одной из нескольких стратегий, сначала идет `Decision` или `Spike`, а уже потом implementation.

### R3. Разбивать по capability, а не по слоям

Нельзя создавать отдельные независимые issues "сделать backend" и "сделать frontend" для одной и той же маленькой user capability, если их нельзя принять по отдельности.

### R4. Каждая задача должна быть трассируема до FR, AC и milestone

Иначе backlog перестает быть управляемым.

### R5. Каждая задача, меняющая данные, обязана учитывать reload

Если issue затрагивает model/notation/project data, в его `Done when` должен быть пункт про сохранение и повторное открытие.

### R6. Каждый milestone должен иметь интеграционный validation issue

Без этого roadmap остается набором локально работающих частей.

### R7. P0 flow имеет приоритет над P1 polishing

Сначала собирается целый demo path, потом улучшаются удобства и дополнительные сценарии.

---

## Типы issues

### 1. Decision

Используется, когда нужно зафиксировать выбор между архитектурно или продуктово различающимися опциями.

`Примеры`:

- финализировать step-up synchronization semantics;
- выбрать правило размещения создаваемых моделей.

### 2. Spike

Используется, когда есть техническая неопределенность, которую дешевле быстро проверить, чем обсуждать.

`Примеры`:

- проверить способ выделения состава frame в React Flow;
- проверить сериализацию/десериализацию сложной модели без потери ссылок.

### 3. Implementation

Основной тип issue для добавления capability.

`Примеры`:

- создать freeform-модель и открыть пустой canvas;
- добавить create/delete edge;
- реализовать create notation from model.

### 4. Validation

Нужен для проверки acceptance fragment, smoke pass или milestone exit.

`Примеры`:

- проверить M2 freeform workflow end-to-end;
- пройти AC-7 для drill-down.

### 5. Bugfix

Создается по факту найденного дефекта, если он мешает acceptance.

### 6. Refinement

Используется для ограниченного улучшения существующей capability, если core уже работает.

`Примеры`:

- добавить список multiple drill-down поверх уже работающего single flow;
- улучшить feedback при missing notation.

---

## Обязательные поля issue

Каждый issue обязан содержать:

- `Title`
- `Type`
- `Milestone`
- `Capability Slice`
- `Goal`
- `Why now`
- `Scope`
- `Out of scope`
- `Dependencies`
- `References to decisions`
- `References to FR`
- `References to AC`
- `References to demo steps`
- `Risks`
- `Done when`

Дополнительно желательно:

- `Files / artifacts likely touched`
- `Open questions`
- `Suggested validation method`

---

## Рекомендуемый шаблон issue

```md
Title: [M2][CS-04][IMP] Create and persist nodes in freeform model

Type: Implementation
Milestone: M2. Freeform Modeling Workspace
Capability Slice: CS-04. Node editing

Goal:
Дать пользователю возможность создавать, перемещать, редактировать и удалять ноды в freeform-модели.

Why now:
Ноды являются основой всего canvas flow; без них нельзя перейти к edges, frame и дальнейшей семантике.

Scope:
- Create node from canvas context menu
- Persist node in model YAML
- Drag-and-drop position updates
- Edit label/description in properties panel
- Delete node with cleanup of dependent references

Out of scope:
- Typed node picker
- Multiple selection
- Advanced styling

Dependencies:
- [M2][CS-03][IMP] Create and open freeform model

Decision references:
- DB-12
- DB-15

FR references:
- FR-3.1
- FR-3.2
- FR-3.3
- FR-3.4
- FR-3.5

AC references:
- AC-4

Demo references:
- Step 4

Risks:
- Position updates may not survive reload
- Delete may leave dangling edges or drill-down links

Done when:
- User can create node through UI
- Position persists after save/reopen
- Label and description are editable
- Deleting node removes dependent edges
- No crash on repeated create/delete cycles
```

---

## Правила именования

Рекомендуемый формат названия:

`[Milestone][Slice][Type] Короткий результат`

Примеры:

- `[M1][CS-01][DEC] Finalize project file placement rules`
- `[M2][CS-03][IMP] Create freeform model and open empty canvas`
- `[M3][CS-08][SPIKE] Validate one-shot step-up generation approach`
- `[M5][CS-15][VAL] Run full 14-step demo acceptance pass`

Это дает:

- читаемую последовательность;
- удобную группировку;
- быстрый visual scan в issue tracker.

---

## Правила granularity

### G1. Issue должен быть достаточно маленьким для независимой приемки

Если задачу нельзя проверить без завершения еще 3-4 подзадач, она слишком большая.

### G2. Issue не должен одновременно закрывать больше одного major capability outcome

Например, `drill-down + step-up + breadcrumbs` в одной задаче недопустимы.

### G3. Если capability требует несколько технически разных шагов, их следует разносить

Например:

- schema/API issue;
- UI/state issue;
- validation issue.

Но только если каждый шаг имеет собственный проверяемый результат.

### G4. Решение о split принимается по acceptance, а не по файловой структуре

Если backend и frontend бессмысленны по отдельности, их лучше держать в одном issue.

### G5. Bugfix не должен маскировать недоделанный scope

Если "bugfix" на самом деле добавляет новую обязательную capability, это не bugfix, а implementation/refinement issue.

---

## Правила зависимостей

### D1. Зависимости должны быть явными

Каждый issue должен ссылаться только на реальные блокирующие predecessor tasks.

### D2. Нельзя зависеть от абстрактного milestone

Зависимость должна указывать на конкретный issue или decision.

### D3. Порядок по умолчанию такой

`Decision -> Spike -> Implementation -> Validation -> Bugfix`

### D4. Нельзя тянуть issue из будущего milestone в текущий

Если для M2 нужен результат из M4, roadmap составлен неверно.

### D5. Data contracts идут раньше UX polish

Сначала schema/link semantics, затем удобство.

### D6. Cross-model links идут только после stable IDs и file placement rules

Это особенно важно для drill-down, step-up, notation references.

---

## Definition of Ready

Issue считается готовым к взятию в работу, когда:

1. Понятно, к какому milestone и capability slice он относится.
2. Есть ссылки на FR и AC.
3. Определены зависимости.
4. Нет скрытого нерешенного decision, который меняет исход implementation.
5. Понятно, что именно находится вне scope.
6. Есть конкретный критерий проверки результата.

Если хотя бы один пункт отсутствует, issue должен быть доработан или заменен на `Decision` / `Spike`.

---

## Definition of Done для issue

Issue считается завершенным, когда:

1. Выполнен заявленный `Goal`.
2. Закрыты все пункты из `Done when`.
3. Поведение соответствует связанным FR и AC.
4. Изменения не ломают уже закрытые slices.
5. Если затронуты YAML-данные, результат сохраняется и восстанавливается после reopen.
6. Для user-facing capability есть минимальная smoke-проверка или ручная проверка.

---

## Канонические паттерны декомпозиции

Ниже даны рекомендуемые шаблоны issue tree для разных типов slices.

### Pattern A. CRUD / editor slice

Подходит для `CS-03`, `CS-04`, `CS-05`, `CS-06`.

Рекомендуемая последовательность:

1. `Decision`, только если schema или file placement еще не закреплены.
2. `Implementation`: data creation/load/save contract.
3. `Implementation`: UI interaction и state wiring.
4. `Validation`: AC smoke pass.
5. `Bugfix`, если validation выявил blockers.

### Pattern B. Cross-model navigation slice

Подходит для `CS-07`, `CS-08`, `CS-09`.

Рекомендуемая последовательность:

1. `Decision`: link semantics and navigation rules.
2. `Spike`, если нужен быстрый техчек.
3. `Implementation`: create/link target artifact.
4. `Implementation`: navigate туда.
5. `Implementation`: navigate обратно и показать context.
6. `Validation`: acceptance for navigation loops.
7. `Bugfix`: broken link, path edge cases.

### Pattern C. Derived artifact slice

Подходит для `CS-11`.

Рекомендуемая последовательность:

1. `Decision`: extraction rules and minimal schema.
2. `Implementation`: derive data from current model.
3. `Implementation`: persist artifact and register in manifest.
4. `Implementation`: bind current model to created artifact.
5. `Validation`: create/open/reuse pass.

### Pattern D. Stability / hardening slice

Подходит для `CS-13`, `CS-14`, `CS-15`.

Рекомендуемая последовательность:

1. `Implementation`: close missing save/reload behavior.
2. `Implementation`: add error-handling surfaces.
3. `Validation`: full milestone smoke.
4. `Validation`: full demo pass.
5. `Bugfix`: critical/high defects only.

---

## Когда split обязателен

Issue **обязан** быть разделен, если:

- в нем более одного capability slice;
- в нем одновременно есть unresolved decision и implementation;
- acceptance можно пройти по частям;
- одна часть затрагивает schema/API, а другая полностью опирается на уже принятый контракт и может быть проверена отдельно;
- появляется длинный список "и еще" вместо одного результата.

---

## Когда split не нужен

Issue **не нужно** дробить, если:

- все изменения направлены на один маленький пользовательский outcome;
- backend, state и UI бессмысленны по отдельности;
- искусственное разделение создаст "полурабочие" задачи без приемки;
- результат проще проверить как единое целое.

---

## Правила для decision issues

Decision issue должен содержать:

- сам вопрос;
- список реально рассматриваемых опций;
- recommended option;
- критерии выбора;
- влияние на roadmap и на последующие issues;
- явный результат в виде обновленного decision backlog или связанного документа.

Decision issue считается done, когда:

- решение зафиксировано письменно;
- следующий implementation issue может стартовать без двусмысленности.

---

## Правила для spike issues

Spike issue нужен только тогда, когда:

- есть технический риск;
- ответ можно получить быстро;
- без ответа есть шанс построить не ту архитектуру.

Spike issue не должен:

- превращаться в скрытый implementation;
- жить дольше одного узкого вопроса;
- оставаться без явного выводного решения.

Spike output:

- короткий результат;
- вывод "берем / не берем";
- обновление decision backlog при необходимости.

---

## Правила для validation issues

У каждого milestone должен быть как минимум один validation issue.

Validation issue должен:

- ссылаться на весь набор AC, который milestone обязан закрыть;
- перечислять шаги ручной проверки;
- фиксировать результаты: pass/fail/findings;
- порождать bugfix issues только на реальные blockers.

Validation issue не должен включать новый scope.

---

## Матрица приоритетов при построении issue tree

Порядок приоритета при формировании backlog:

1. Блокирующие decisions
2. P0 capability slices
3. Save/reload integrity для уже сделанных slices
4. Acceptance validation
5. P1 convenience features
6. Stretch improvements

---

## Правила для риска и неопределенности

Если issue затрагивает риск из risk register, он должен явно это указывать.

Примеры:

- step-up behavior risk;
- YAML scalability risk;
- autosave freeze risk;
- non-intuitive navigation risk.

Для таких issues в `Done when` стоит добавлять не только "работает", но и "не создает известный риск в базовом объеме MVP".

---

## Правила сборки milestone из issues

Milestone считается корректно собранным, если в нем есть:

1. Не более 1-2 blocking decision/spike issues на slice.
2. Полный набор implementation issues на обязательные capability slices.
3. Минимум один validation issue на milestone.
4. Явные bugfix slots после validation.
5. Понятный exit criterion.

### Пример логики milestone

`M2. Freeform Modeling Workspace`

Состав:

1. `[M2][CS-03][IMP]` Create and open freeform model
2. `[M2][CS-04][IMP]` Create and persist nodes
3. `[M2][CS-05][IMP]` Create and delete directed edges
4. `[M2][CS-06][IMP]` Create and persist frames
5. `[M2][CS-04][VAL]` Validate freeform editing flow
6. `[M2][CS-06][BUG]` Fix blockers from validation

Этого уже достаточно, чтобы milestone был последовательным и не плоским.

---

## Антипаттерны backlog

Нельзя допускать следующие типы issues:

### A1. Technical bucket

Пример: `Сделать frontend архитектуру`.

Проблема: нет пользовательского результата и acceptance.

### A2. Mega-issue

Пример: `Сделать canvas с нодами, edges, frame, drill-down и сохранением`.

Проблема: неясно, что считать done и где искать regressions.

### A3. Hidden decision

Пример: `Реализовать step-up`, когда еще не решено, live sync это или one-shot.

### A4. Premature platforming

Пример: `Ввести plugin API для будущих нотаций`.

Проблема: решение не помогает пройти MVP demo.

### A5. Layer-only split

Пример: отдельные задачи `REST API для нод` и `UI для нод`, хотя принимаются только вместе.

---

## Минимальные требования к AI-промпту, который будет генерировать Issues

Если дерево issues генерирует AI, промпт должен требовать:

1. Сначала определить milestone и capability slices.
2. Затем выделить blocking decisions.
3. Затем построить последовательные issues с зависимостями.
4. Для каждого issue указать FR, AC, demo steps и Done when.
5. Не смешивать post-MVP темы с MVP critical path.
6. Добавлять validation issue в конец каждого milestone.

---

## Итоговое правило

Хорошее дерево issues для этого проекта выглядит так:

- milestones собраны из capability slices;
- каждый slice превращается в короткую последовательность `decision -> implementation -> validation`;
- save/reload и acceptance не оставлены "на потом";
- все задачи связаны с проверяемым demo flow;
- backlog не распадается на абстрактные технические темы.

Именно такой формат следует использовать как основу для следующего шага: генерации roadmap в виде последовательных Issues и Milestones.
