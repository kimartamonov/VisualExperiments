# [M2-04] Create and persist frames as semantic containers

## Metadata

- Issue ID: M2-04
- Type: Implementation
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-06. Frame as semantic container
- Priority: P0
- Sequence Order: 4
- Depends On:
  - M2-02
  - M2-03
- Unlocks:
  - M2-05
  - M3-01
  - M3-05
- Decision References:
  - DB-12
- FR References:
  - FR-5.1
  - FR-5.2
  - FR-5.3
  - FR-5.4
- AC References:
  - AC-6
- Demo References:
  - Step 5
  - Step 6
- Risk References:
  - R5

## Goal

- Дать пользователю frame как сохраняемый семантический контейнер для группы нод.
- Подготовить data contract для будущего step-up без реализации step-up внутри этого issue.

## Why Now

- Step-up невозможен без frame как отдельной сущности, а не просто прямоугольника на canvas.
- Этот issue завершает свободное моделирование до перехода к hierarchy/navigation milestone.
- Он закрывает demo step 5 и формирует вход для step-up decisions.

## User/System Outcome

- Пользователь может создать frame, дать ему имя и описание, а также управлять составом нод.
- Система хранит frame как отдельную сущность с собственным id и списком node ids.
- Roadmap получает стабильный semantic container для M3.

## Scope

- Создание frame на canvas.
- Задание `name` и `description` для frame.
- Добавление и удаление node ids из состава frame.
- Сохранение frame и его состава в YAML.
- Безопасное удаление frame без удаления входящих нод.

## Out of Scope

- Step-up synchronization semantics.
- Typed semantics for frame.
- Live sync frame contents with upper-level representation.

## Preconditions

- Ноды и edges в модели уже работают и сохраняются.
- Stable node ids доступны для membership в frame.
- Frame contract в schema v1 допускает `stepUp: null` до M3.

## Implementation Notes

- Сохраняйте frame как доменную сущность, а не как purely visual rectangle.
- Membership должен опираться на node ids, а не на координаты как единственный источник истины.
- Если предусмотрено удаление frame, оно не должно удалять или портить ноды.
- `stepUp` на этом этапе остается `null` или пустым, пока M3 не заполнит его.

## Files and Artifacts Expected to Change

- Canvas frame interactions and rendering.
- Properties panel for frame metadata.
- Model state for frame collection and node membership.
- YAML serialization/deserialization for frames.

## Acceptance Criteria for This Issue

- Frame создается и отображается как контейнер на canvas.
- Frame имеет `name` и `description`.
- Пользователь может добавлять ноды во frame и убирать их из него.
- Frame сохраняется как сущность с membership на stable node ids.
- При удалении frame ноды остаются на canvas и модель остается валидной.

## Required Tests

### Functional checks

- Создать frame, присвоить ему имя и описание.
- Добавить в frame несколько нод и убрать одну из них.
- Удалить frame и убедиться, что ноды остались.

### Smoke checks

- Повторить create/update/delete frame цикл несколько раз.
- Проверить, что frame не ломает базовое взаимодействие с нодами и edges.

### Regression checks

- Убедиться, что node editing и edge editing из M2-02/M2-03 не сломаны.
- Проверить, что открытие модели с frame не ломает canvas rendering.

### Persistence/reload checks

- Сохранить и переоткрыть модель с frame; membership и metadata должны восстановиться.
- Проверить, что `stepUp` остается корректно пустым до M3.

## Handoff to Next Issue

### What now works

- Freeform-модель поддерживает frame как семантический контейнер.
- Membership и metadata frame устойчиво сохраняются.

### What contract is now stable

- Frame entity с `id`, `name`, `description`, `nodes[]`, `stepUp`.
- Поведение удаления frame без удаления нод.

### What next issue can start

- M2-05 может валидировать полный freeform workflow.
- M3-01 и M3-05 могут опираться на frame как вход для step-up.

## Done Definition

1. AC-6 выполняется полностью.
2. Frame существует как semantic container, а не только visual decoration.
3. Persist/reload проверен для membership и metadata.
4. Step-up logic не втащена преждевременно в этот issue.