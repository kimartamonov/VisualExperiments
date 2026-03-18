# [M2-03] Create and delete directed edges

## Metadata

- Issue ID: M2-03
- Type: Implementation
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-05. Edge editing
- Priority: P0
- Sequence Order: 3
- Depends On:
  - M2-02
- Unlocks:
  - M2-04
  - M2-05
- Decision References:
  - DB-09
  - DB-12
- FR References:
  - FR-4.1
  - FR-4.3
- AC References:
  - AC-5
- Demo References:
  - Step 4
- Risk References:
  - R5

## Goal

- Дать пользователю возможность связывать ноды направленными edges и удалять эти связи.
- Зафиксировать минимальный edge contract MVP без typed edges и сложной маршрутизации.

## Why Now

- После появления нод пользователь должен уметь строить диаграмму, а не только набор изолированных объектов.
- Edge semantics нужна до frame, потому что frame группирует уже осмысленную часть graph.
- Этот issue закрывает вторую половину demo step 4.

## User/System Outcome

- Пользователь может визуально связывать ноды стрелками и удалять связи.
- Система сохраняет `source`, `target` и stable edge id в YAML.
- Roadmap получает базовый graph editing path без усложнения typed-edge scope.

## Scope

- Создание directed edge между двумя существующими нодами.
- Визуальное отображение направления связи.
- Удаление edge.
- Persist/reload edge list.
- Корректная очистка edges при удалении связанной ноды.

## Out of Scope

- Edge labels как обязательная часть MVP path.
- Typed edges.
- Advanced routing or styling.

## Preconditions

- M2-02 завершил node editing и stable node ids.
- Model schema v1 содержит коллекцию `edges`.
- Typed-edge scope исключен из MVP по DB-09.

## Implementation Notes

- Edge id должен быть стабильным и не строиться из текущих координат.
- Проверяйте, что edge не переживает удаление source/target node.
- Не добавляйте доменную типизацию или validation rules сверх MVP.

## Files and Artifacts Expected to Change

- Canvas edge interaction layer.
- Model state for edge collection.
- YAML serialization/deserialization for edges.
- Smoke-test assets for graph editing.

## Acceptance Criteria for This Issue

- Направленная стрелка создается между двумя нодами.
- Направление визуально различимо на canvas.
- Edge можно удалить без повреждения модели.
- После reopen проекта edge list восстанавливается корректно.
- Удаление ноды не оставляет dangling edge references.

## Required Tests

### Functional checks

- Создать несколько edges между нодами.
- Удалить отдельный edge и проверить обновление модели.
- Удалить ноду с edges и проверить cleanup.

### Smoke checks

- Повторить create/delete edges несколько раз подряд.
- Проверить отсутствие crash при создании нескольких связей в одной модели.

### Regression checks

- Убедиться, что node editing из M2-02 не сломан.
- Проверить, что модель по-прежнему корректно открывается после добавления edges.

### Persistence/reload checks

- Сохранить модель, переоткрыть ее и проверить source/target ids.
- Проверить отсутствие потери edges после round-trip через YAML.

## Handoff to Next Issue

### What now works

- Freeform-модель поддерживает минимально полезный graph из нод и directed edges.
- Graph data устойчиво хранится на диске.

### What contract is now stable

- Edge entity contract с `id`, `source`, `target`.
- Cleanup behavior при удалении ноды.

### What next issue can start

- M2-04 может группировать существующие node ids во frame.
- M2-05 может валидировать полноценный freeform editing flow.

## Done Definition

1. AC-5 выполняется полностью.
2. Graph editing path node -> edge работает без критических дефектов.
3. Persist/reload проверен для edge list.
4. Typed-edge или advanced-routing scope не затянут в реализацию.