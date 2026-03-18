# [M2-02] Create and persist nodes in freeform models

## Metadata

- Issue ID: M2-02
- Type: Implementation
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-04. Node editing
- Priority: P0
- Sequence Order: 2
- Depends On:
  - M2-01
- Unlocks:
  - M2-03
  - M2-04
  - M4-01
- Decision References:
  - DB-12
  - DB-15
- FR References:
  - FR-3.1
  - FR-3.2
  - FR-3.3
  - FR-3.4
  - FR-3.5
- AC References:
  - AC-4
- Demo References:
  - Step 4
- Risk References:
  - R5

## Goal

- Дать пользователю полный базовый lifecycle ноды: create, move, edit, delete.
- Стабилизировать сохранение node properties и positions в freeform-модели.

## Why Now

- Ноды являются базовым строительным блоком всего canvas flow.
- Без устойчивых nodes нельзя корректно перейти к edges, frames, drill-down, step-up и typing.
- Этот issue закрывает центральную часть freeform editing и делает Step 4 достижимым.

## User/System Outcome

- Пользователь может создавать ноды через UI, двигать их, менять label/description и удалять.
- Система сохраняет ids, позиции и свойства нод в YAML и восстанавливает их при reopen.
- Roadmap получает устойчивую семантическую единицу для последующих slices.

## Scope

- Создание ноды через canvas UI.
- Drag-and-drop перемещение с сохранением позиции.
- Редактирование `label` и `description` через properties panel.
- Удаление ноды с очисткой зависящих данных там, где это уже релевантно.
- Persist/reload полного node state.

## Out of Scope

- Typed node picker.
- Group selection and complex styling.
- Drill-down UX и type assignment.

## Preconditions

- M2-01 создает и открывает freeform-модель.
- Properties panel и canvas shell уже существуют как UI-контейнеры.
- Model schema v1 фиксирует Node как самостоятельную сущность со stable id.

## Implementation Notes

- Node id должен быть стабильным и не зависеть от label.
- Удаление ноды не должно оставлять dangling edges уже на этом этапе.
- `description` допускается пустой строкой, если пользователь ее не заполнил.
- Persisted state включает координаты и доменные поля, но не runtime selection state.

## Files and Artifacts Expected to Change

- Canvas interaction layer.
- Model state / node reducers or services.
- Properties panel for node fields.
- YAML serialization/deserialization for nodes.

## Acceptance Criteria for This Issue

- Ноды создаются через UI на canvas.
- Ноды перемещаются drag-and-drop и сохраняют позицию после reopen.
- Label и description редактируются через свойства ноды.
- При удалении ноды связанные edges удаляются или не создают dangling references.
- Повторные create/edit/delete циклы не приводят к крашу.

## Required Tests

### Functional checks

- Создать несколько нод, переместить их и изменить label/description.
- Удалить одну из нод и проверить корректное состояние модели.

### Smoke checks

- Повторить create/move/edit/delete цикл несколько раз подряд.
- Проверить, что canvas остается интерактивным при базовой нагрузке.

### Regression checks

- Убедиться, что M2-01 create/open model flow не сломан.
- Проверить, что пустая модель по-прежнему открывается корректно.

### Persistence/reload checks

- Сохранить модель, переоткрыть проект и убедиться, что позиции и свойства нод восстановлены.
- Проверить отсутствие dangling data после удаления ноды.

### UI state checks

- Проверить предсказуемость выбора ноды и редактирования полей.

## Handoff to Next Issue

### What now works

- Freeform-модель содержит устойчивые ноды с сохранением позиции и свойств.
- Базовая работа с graph objects стала реальной, а не пустым canvas.

### What contract is now stable

- Node entity contract в YAML и in-memory state.
- Basic node editing UX.

### What next issue can start

- M2-03 может добавлять directed edges между существующими нодами.
- M2-04 может строить frame membership поверх стабильных node ids.
- M4-01 позже сможет опираться на node properties для late typing.

## Done Definition

1. AC-4 выполняется полностью.
2. Node editing проходит happy path без критических сбоев.
3. Persist/reload проверен для node ids, positions и text properties.
4. Удаление ноды не оставляет blocker-level мусора в модели.