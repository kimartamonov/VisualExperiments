# [M3-05] Implement step-up generation and upper-level navigation

## Metadata

- Issue ID: M3-05
- Type: Implementation
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-08. Step-up generation and upper-level navigation
- Priority: P0
- Sequence Order: 5
- Depends On:
  - M3-01
  - M3-02
  - M3-03
  - M2-04
- Unlocks:
  - M3-07
  - M5-01
- Decision References:
  - DB-16
  - DB-17
  - DB-18
- FR References:
  - FR-7.1
  - FR-7.2
  - FR-7.3
  - FR-10.2
  - FR-10.3
- AC References:
  - AC-8
- Demo References:
  - Step 6
  - Step 7
- Risk References:
  - R1
  - R4
  - R5

## Goal

- Реализовать MVP step-up flow: из frame создавать верхнеуровневую модель с представительной нодой и поддерживать обратимую навигацию.
- Закрыть сценарий движения вверх по абстракции без live sync и без потери ссылочной целостности.

## Why Now

- После фиксации semantics и техпроверки можно реализовать основной step-up behavior.
- Этот issue закрывает наиболее рискованную capability M3 и demo steps 6-7.
- Без него продукт не подтверждает ключевую гипотезу движения вверх по abstraction levels.

## User/System Outcome

- Пользователь может выбрать frame и выполнить step-up.
- Система создает upper-level model, representative node и ссылку `frame.stepUp`.
- Пользователь может перейти в верхнеуровневую модель и вернуться обратно.

## Scope

- Добавить action `step-up` для frame.
- Создать верхнеуровневую модель по file placement rule.
- Создать representative node в новой модели.
- Сохранить link `frame.stepUp = { model, nodeId }`.
- Открывать upper-level model и возвращаться в исходную модель через navigation context.
- Поддержать MVP-поведение повторного запуска step-up согласно M3-01.

## Out of Scope

- Live synchronization between frame and upper-level graph.
- Автоматическая реконфигурация upper-level representation при каждом изменении frame.
- Advanced layout generation for upper-level model.

## Preconditions

- M3-01 зафиксировал semantics, M3-02 подтвердил viability.
- M3-03 дал общий механизм возврата.
- M2-04 стабилизировал frame как semantic container.

## Implementation Notes

- Step-up является логической операцией model semantics layer, а не встроенной функцией React Flow.
- Upper-level model и representative node должны иметь stable ids и предсказуемые paths.
- Повторный запуск step-up должен следовать зафиксированной manual regeneration policy.
- Ошибки чтения step-up target позже hardenятся в M5, но базовый happy path должен быть устойчив уже здесь.

## Files and Artifacts Expected to Change

- Frame actions and properties UI.
- Backend/frontend orchestration for upper-level model creation.
- YAML persistence for `Frame.stepUp` and created model file.
- Navigation/open-model flow.

## Acceptance Criteria for This Issue

- Для frame доступна операция step-up.
- После запуска создается верхнеуровневая модель с нодой, представляющей frame.
- `frame.stepUp` сохраняет путь к модели и `nodeId` representative node.
- Переход в upper-level model и возврат обратно работают.
- Повторный запуск step-up следует agreed semantics и не создает хаотичного дублирования.

## Required Tests

### Functional checks

- Создать frame и выполнить step-up.
- Открыть верхнеуровневую модель и вернуться в исходную.
- Проверить содержимое `frame.stepUp` и upper-level model file.

### Smoke checks

- Повторить step-up flow минимум два раза на разных frame.
- Проверить отсутствие crash при переходах вверх и назад.

### Regression checks

- Убедиться, что исходная модель и frame остаются валидными.
- Проверить, что drill-down navigation и basic workspace behavior не сломаны.

### Persistence/reload checks

- Сохранить проект и переоткрыть его; step-up links и upper-level model должны восстановиться.
- Проверить, что representative node id остается стабильным после round-trip.

### Navigation checks

- Проверить открытие upper-level model, back и breadcrumbs.
- Проверить сохранение контекста при возврате к исходному frame.

## Handoff to Next Issue

### What now works

- Step-up flow работает на MVP-уровне и обратим по навигации.
- Frame -> upper-level model link semantics стабилизированы.

### What contract is now stable

- `Frame.stepUp` contract.
- Manual regeneration / repeat behavior для step-up.

### What next issue can start

- M3-07 может валидировать полный hierarchy milestone.
- M5-01 позже сможет включить step-up links в round-trip persistence validation.

## Done Definition

1. AC-8 выполняется полностью.
2. Demo steps 6-7 проходят end-to-end.
3. Step-up links выдерживают save/reopen.
4. Live-sync complexity не затянута в MVP implementation.