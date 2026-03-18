# [M3-04] Implement drill-down create, open and return flow

## Metadata

- Issue ID: M3-04
- Type: Implementation
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-07. Drill-down creation and navigation
- Priority: P0
- Sequence Order: 4
- Depends On:
  - M1-01
  - M2-01
  - M2-02
  - M3-03
- Unlocks:
  - M3-06
  - M3-07
  - M5-02
- Decision References:
  - DB-06
  - DB-16
  - DB-18
  - DB-20
  - DB-22
- FR References:
  - FR-6.1
  - FR-6.2
  - FR-6.3
  - FR-10.2
  - FR-10.3
- AC References:
  - AC-7
- Demo References:
  - Step 8
  - Step 9
- Risk References:
  - R4
  - R5

## Goal

- Дать пользователю single drill-down happy path: создать или привязать дочернюю модель, открыть ее и вернуться назад.
- Зафиксировать ссылочную семантику drill-down как ссылок на model paths, а не как вложенность React Flow.

## Why Now

- Drill-down является обязательной частью demo flow и один из ключевых differentiators продукта.
- Navigation context уже готов, поэтому можно строить feature-specific flow без дублирования логики возврата.
- Этот issue создает базу для multiple drill-down refinement и для error handling в M5.

## User/System Outcome

- Пользователь может из properties panel ноды создать новую дочернюю модель или связать существующую.
- Система сохраняет drill-down links как массив относительных путей в `Node.drilldowns`.
- Roadmap закрывает Steps 8-9 базовым happy path.

## Scope

- Добавить секцию drill-down в properties panel ноды.
- Поддержать создание новой дочерней модели по file placement rule.
- Поддержать привязку существующей модели к ноде.
- Открывать выбранную дочернюю модель на canvas.
- Возвращаться назад через общий navigation context.
- Показать понятное сообщение recovery path при отсутствии target file.

## Out of Scope

- Несколько drill-down links на уровне полноценного списка/выбора.
- Shared editing нескольких связанных моделей одновременно.
- Semantic validation содержимого дочерней модели.

## Preconditions

- M3-03 стабилизировал breadcrumbs/back behavior.
- M2-01 умеет создавать и открывать модельные файлы.
- Node ids и model placement rules устойчивы.

## Implementation Notes

- Drill-down link хранится как относительный path в `Node.drilldowns[]`.
- Путь создания новой модели должен следовать M1-01 rules, а не invent new placement logic.
- Missing target должен вести к понятному recovery prompt, а не к аварии.
- Single-link UX может быть минимальным, но data model сразу должен оставаться совместимым с несколькими links.
- Новый drill-down file по умолчанию создается в той же папке, что и текущая модель; в ссылке сохраняется путь относительно корня проекта.
- Slug дочерней модели может опираться на `Node.label`, но identity должна определяться `id`, а не label.

## Files and Artifacts Expected to Change

- Properties panel for node drill-down section.
- Backend/frontend model linking flow.
- YAML persistence for `Node.drilldowns`.
- Navigation/open-model orchestration.

## Acceptance Criteria for This Issue

- В свойствах ноды доступна drill-down секция.
- Пользователь может создать новую дочернюю модель или привязать существующую.
- Переход в дочернюю модель открывает ее на canvas.
- Возврат работает через back и/или breadcrumbs.
- При отсутствии файла отображается понятное сообщение вида «Модель не найдена. Создать?».

## Required Tests

### Functional checks

- Создать новый drill-down для ноды и открыть его.
- Привязать существующую модель как drill-down и открыть ее.
- Вернуться в исходную модель.

### Smoke checks

- Повторить create/open/return цикл несколько раз подряд.
- Проверить, что основная модель не теряет данные после работы с drill-down.

### Regression checks

- Убедиться, что M2 freeform editing не сломан.
- Проверить, что breadcrumbs/back из M3-03 по-прежнему работают.

### Persistence/reload checks

- Сохранить проект и переоткрыть его; drill-down links должны восстановиться.
- Проверить, что broken path корректно обрабатывается после reopen.

### Navigation checks

- Проверить переход туда и обратно.
- Проверить сохранение project context при возврате.

## Handoff to Next Issue

### What now works

- Single drill-down path работает end-to-end.
- Cross-model link semantics для child models стабилизированы.

### What contract is now stable

- `Node.drilldowns[]` как массив относительных путей.
- Drill-down create/open/return behavior.

### What next issue can start

- M3-06 может расширить UX до multiple drill-down.
- M3-07 может валидировать весь navigation milestone.
- M5-02 позже сможет hardenить broken-link recovery.

## Done Definition

1. AC-7 закрыт для single drill-down path.
2. Demo steps 8-9 проходят без обходных путей.
3. Drill-down links сохраняются и восстанавливаются при reopen.
4. Архитектура не блокирует multiple drill-down support.
