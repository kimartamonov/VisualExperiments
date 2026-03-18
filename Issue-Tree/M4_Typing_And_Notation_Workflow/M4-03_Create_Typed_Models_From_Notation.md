# [M4-03] Create typed models from notation

## Metadata

- Issue ID: M4-03
- Type: Implementation
- Status: Proposed
- Milestone: M4. Typing and Notation Workflow
- Capability Slice: CS-12. Typed model creation from notation
- Priority: P0
- Sequence Order: 3
- Depends On:
  - M4-02
  - M2-02
- Unlocks:
  - M4-04
  - M5-01
- Decision References:
  - DB-13
  - DB-23
  - DB-18
- FR References:
  - FR-2.2
  - FR-9.2
- AC References:
  - AC-11
- Demo References:
  - Step 12
  - Step 13
- Risk References:
  - R7
  - R5

## Goal

- Дать пользователю возможность создать новую модель по существующей notation и использовать доступные типы сразу на этапе создания нод.
- Завершить полный MVP-cycle freeform -> typing -> notation -> typed model.

## Why Now

- Без typed model notation остается пассивным артефактом и не подтверждает product hypothesis.
- После появления real notation artifact можно построить create-model flow, опирающийся на type catalog.
- Этот issue закрывает Steps 12-13 и завершает основной смысл M4.

## User/System Outcome

- Пользователь создает новую typed-модель, выбирая одну из доступных нотаций.
- Canvas показывает типы из notation в create-node flow.
- Создаваемые ноды сразу получают type and color из выбранной notation.

## Scope

- Добавить create typed model flow с выбором notation.
- Создавать model file, где `notation` указывает на выбранную notation.
- Показывать список available types при создании ноды на canvas.
- Применять type and color из notation при создании node.
- Сохранять и открывать typed models в рамках того же editor workspace.

## Out of Scope

- Strict conformance engine for notation rules.
- Default templates per notation.
- Typed edges or richer semantics beyond object type catalog.

## Preconditions

- M4-02 создал хотя бы одну notation и зарегистрировал ее в project manifest.
- Node creation flow уже существует в M2.
- DB-23 ограничивает typed model behavior списком типов и их цветов без deep rule engine.

## Implementation Notes

- Typed model должен использовать общий `Model` format и отличаться только значением `notation`.
- Type picker может быть минимальным, если он надежно покрывает create-node path.
- Не вводите строгую бизнес-валидацию typed models beyond docs.
- Убедитесь, что create/open typed model reuse existing canvas/editor infrastructure.

## Files and Artifacts Expected to Change

- Model creation UI for notation choice.
- Canvas node creation menu/picker.
- Model persistence for typed model files.
- Manual test assets for typed modeling.

## Acceptance Criteria for This Issue

- Пользователь может создать новую модель, выбрав существующую notation.
- Типы из notation доступны в create-node flow.
- Новые ноды получают type and color из выбранной notation.
- Typed model сохраняется и открывается без потери связи с notation.

## Required Tests

### Functional checks

- Создать typed model по существующей notation.
- Добавить несколько нод разных типов.
- Проверить, что новые ноды получают правильный type/color.

### Smoke checks

- Повторить create typed model flow несколько раз подряд.
- Проверить отсутствие crash при пустом и непустом списке notations.

### Regression checks

- Убедиться, что freeform node creation и notation extraction не сломаны.
- Проверить, что общая editor infrastructure повторно используется без regressions.

### Persistence/reload checks

- Сохранить проект и переоткрыть его; typed model и ее notation reference должны восстановиться.
- Проверить round-trip новых typed nodes через YAML.

## Handoff to Next Issue

### What now works

- Проект поддерживает создание typed models по notation.
- Нотация стала рабочим, а не только документальным артефактом.

### What contract is now stable

- Typed model creation policy and notation reference behavior.
- Type picker and node creation semantics for typed canvas.

### What next issue can start

- M4-04 может валидировать весь typing/notation workflow.
- M5-01 сможет включить typed models and notation references в round-trip checks.

## Done Definition

1. AC-11 выполняется полностью.
2. Demo steps 12-13 проходят end-to-end.
3. Typed model and notation reference выдерживают reopen.
4. Scope не уходит в rule engine or strict validation platform.