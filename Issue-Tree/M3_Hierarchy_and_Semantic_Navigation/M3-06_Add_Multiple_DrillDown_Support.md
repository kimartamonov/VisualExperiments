# [M3-06] Add multiple drill-down support

## Metadata

- Issue ID: M3-06
- Type: Refinement
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-09. Multiple drill-down support
- Priority: P0
- Sequence Order: 6
- Depends On:
  - M3-04
- Unlocks:
  - M3-07
  - M5-01
- Decision References:
  - DB-22
  - DB-20
- FR References:
  - FR-6.4
  - FR-6.5
- AC References:
  - AC-7
- Demo References:
  - Step 8
  - Step 9
- Risk References:
  - R4
  - R5

## Goal

- Расширить working single drill-down flow до поддержки нескольких альтернативных детализаций для одной ноды.
- Сохранить data model совместимой с `Node.drilldowns[]` как P0-требованием MVP.

## Why Now

- Core single drill-down path уже должен работать до начала refinement.
- FR-6.4 и FR-6.5 входят в P0 scope и не должны быть забыты до завершения M3.
- Этот issue закрывает gap между минимальным happy path и полным MVP scope.

## User/System Outcome

- Пользователь может хранить несколько drill-down моделей у одной ноды и выбрать нужную.
- Система поддерживает add/remove link без удаления самих дочерних моделей.
- Roadmap закрывает полный scope CS-09 до перехода к typing workflow.

## Scope

- Показать список drill-down links для выбранной ноды.
- Дать выбрать, какую детализирующую модель открыть.
- Поддержать добавление еще одной ссылки без разрушения существующей.
- Поддержать удаление только ссылки, а не самой модели.
- Сохранить список ссылок после reopen.

## Out of Scope

- Автоматические рекомендации drill-down based on notation.
- Одновременное сравнение нескольких child models.
- Multi-user editing linked models.

## Preconditions

- M3-04 закрыл single drill-down happy path.
- Data model уже хранит drill-down как массив путей.
- Navigation context из M3-03 работает стабильно.

## Implementation Notes

- Не перепроектируйте `Node.drilldowns[]`; используйте существующий контракт.
- UX может быть минимальным списком, если он надежно покрывает add/open/remove.
- Удаление ссылки не должно удалять сам model file.
- Broken-link handling должен оставаться совместимым с DB-20.

## Files and Artifacts Expected to Change

- Properties panel drill-down list UI.
- Link-management actions.
- YAML persistence and reopen behavior for `Node.drilldowns[]`.
- Manual test scenarios for multi-link navigation.

## Acceptance Criteria for This Issue

- Нода может хранить более одной drill-down ссылки.
- Пользователь может выбрать любую из связанных моделей для открытия.
- Удаление link не удаляет саму модель.
- После reopen список ссылок и возможность выбора сохраняются.

## Required Tests

### Functional checks

- Добавить второй drill-down к одной ноде.
- Открыть по очереди оба варианта детализации.
- Удалить одну ссылку и проверить сохранность второй и самих моделей.

### Smoke checks

- Повторить add/open/remove flow несколько раз.
- Проверить, что properties UI не ломается при 2-3 ссылках.

### Regression checks

- Убедиться, что single drill-down path по-прежнему работает.
- Проверить, что step-up и navigation context не затронуты негативно.

### Persistence/reload checks

- Сохранить проект и переоткрыть его; список drill-down links должен восстановиться.

### Navigation checks

- Проверить переход туда и обратно для каждой из связанных моделей.

## Handoff to Next Issue

### What now works

- Drill-down поддерживает не только happy-path одну ссылку, но и полный MVP multi-link scope.
- Link management отделен от lifecycle самих моделей.

### What contract is now stable

- `Node.drilldowns[]` как полноценный список ссылок.
- Add/open/remove semantics for linked models.

### What next issue can start

- M3-07 может валидировать M3 как завершенный navigation milestone.
- M5-01 сможет включить multiple drill-down в round-trip validation.

## Done Definition

1. FR-6.4 и FR-6.5 покрыты на MVP-уровне.
2. Архитектура drill-down не ограничена одной ссылкой.
3. Ссылки и выбор между ними переживают reopen.
4. Refinement не создал новый scope за пределами CS-09.