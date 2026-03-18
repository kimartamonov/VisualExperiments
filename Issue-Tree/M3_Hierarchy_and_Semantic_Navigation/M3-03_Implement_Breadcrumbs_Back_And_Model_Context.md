# [M3-03] Implement breadcrumbs, back stack and model context

## Metadata

- Issue ID: M3-03
- Type: Implementation
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-07. Drill-down creation and navigation
- Priority: P0
- Sequence Order: 3
- Depends On:
  - M2-06
  - M3-02
- Unlocks:
  - M3-04
  - M3-05
  - M3-07
- Decision References:
  - DB-16
  - DB-20
- FR References:
  - FR-10.2
  - FR-10.3
- AC References:
  - AC-7
  - AC-8
- Demo References:
  - Step 7
  - Step 9
- Risk References:
  - R4

## Goal

- Реализовать единый navigation context для переходов между моделями через breadcrumbs и кнопку back.
- Подготовить общий механизм возврата для drill-down и step-up flows.

## Why Now

- Без общего navigation context каждый cross-model slice будет собирать собственную логику возврата.
- FR-10.2 и FR-10.3 входят сразу в оба navigation flows и должны быть стабилизированы заранее.
- Этот issue снижает риск R4 до начала feature-specific navigation.

## User/System Outcome

- Пользователь видит, где он находится в текущем model path, и может безопасно вернуться назад.
- Система хранит runtime navigation stack отдельно от persisted model data.
- Roadmap получает общую основу для drill-down и step-up acceptance.

## Scope

- Реализовать breadcrumbs для текущего model path.
- Реализовать back action для возврата в предыдущую модель.
- Отразить текущий model context в workspace header или эквивалентном месте.
- Обеспечить повторное использование navigation mechanism двумя направлениями переходов.

## Out of Scope

- Создание новых моделей по drill-down или step-up.
- Persist runtime navigation stack в YAML.
- Logical tree beyond current navigation path.

## Preconditions

- M3-02 подтвердил технический путь cross-model navigation.
- DB-15 запрещает сохранять breadcrumbs stack как persisted model state.
- Workspace shell уже стабилен и может принять navigation UI.

## Implementation Notes

- Navigation stack является runtime-only state.
- Breadcrumbs должны быть понятны даже при похожих именах моделей; опирайтесь на stable path/context, а не только на display name.
- Ошибки битых ссылок должны вести к понятному fallback, а не к crash.
- Не связывайте решение с конкретно drill-down или step-up UI, чтобы reuse был прямым.

## Files and Artifacts Expected to Change

- Frontend navigation state and workspace header UI.
- Model-opening orchestration.
- Error/fallback messaging for broken navigation targets.
- Smoke-test scenarios for forward/back loops.

## Acceptance Criteria for This Issue

- Пользователь видит breadcrumbs для текущего navigation path.
- Кнопка back возвращает к предыдущей модели без потери текущего project context.
- Navigation runtime state не сериализуется в model YAML.
- Broken target не приводит к crash и переводит пользователя в понятный recovery path.

## Required Tests

### Functional checks

- Пройти модель A -> модель B -> back.
- Проверить обновление breadcrumbs при каждом переходе.

### Smoke checks

- Повторить navigation loop несколько раз подряд.
- Проверить, что UI не теряет project/workspace context.

### Regression checks

- Убедиться, что file tree и open model behavior не сломаны.
- Проверить, что navigation stack не попадает в persisted data.

### Navigation checks

- Проверить возврат через back и через breadcrumbs.
- Проверить сохранение контекста при переходе между несколькими моделями.

## Handoff to Next Issue

### What now works

- В workspace есть единый navigation context для cross-model flows.
- Возврат в предыдущую модель больше не нужно решать отдельно в каждом feature issue.

### What contract is now stable

- Runtime navigation stack.
- Breadcrumb and back behavior.

### What next issue can start

- M3-04 может реализовать drill-down create/open/return поверх общей navigation base.
- M3-05 может использовать тот же navigation contract для upper-level model.

## Done Definition

1. FR-10.2 и FR-10.3 закрыты на базовом MVP-уровне.
2. Breadcrumbs/back работают без сериализации runtime-state в YAML.
3. Navigation context устойчив для обоих направлений переходов.
4. Нет blocker-level дефекта, мешающего перейти к drill-down implementation.