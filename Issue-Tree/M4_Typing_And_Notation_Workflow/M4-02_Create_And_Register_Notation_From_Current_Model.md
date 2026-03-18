# [M4-02] Create and register notation from current model

## Metadata

- Issue ID: M4-02
- Type: Implementation
- Status: Proposed
- Milestone: M4. Typing and Notation Workflow
- Capability Slice: CS-11. Notation extraction from model
- Priority: P0
- Sequence Order: 2
- Depends On:
  - M4-01
  - M1-01
- Unlocks:
  - M4-03
  - M4-04
  - M5-01
- Decision References:
  - DB-11
  - DB-13
  - DB-19
- FR References:
  - FR-9.1
- AC References:
  - AC-10
- Demo References:
  - Step 11
- Risk References:
  - R7
  - R5

## Goal

- Дать пользователю возможность зафиксировать найденные типы текущей модели как отдельную reusable notation.
- Связать текущую модель с созданной notation без потери исходной диаграммы.

## Why Now

- После late typing у модели появляется достаточная семантика для извлечения notation.
- Этот issue закрывает центральный product transition от практики моделирования к reusable language.
- Typed model creation должен опираться уже на реальный notation artifact, а не на in-memory draft.

## User/System Outcome

- Пользователь запускает «Create notation» и получает YAML-файл в `notations/`.
- Система извлекает уникальные типы и цвета, регистрирует notation в manifest и связывает текущую модель с ней.
- Roadmap закрывает Step 11 и формирует вход для typed model creation.

## Scope

- Реализовать action `Create notation from current model`.
- Извлечь уникальные type/color pairs из текущей модели.
- Создать notation YAML file в `notations/`.
- Обновить `project.yaml` списком notations.
- Связать текущую модель с созданной notation.
- Сохранить исходную диаграмму без пересоздания.

## Out of Scope

- Visual notation editing.
- Deep normalization of poor type names.
- Rich meta-rules beyond type/color catalog.

## Preconditions

- M4-01 завершил late typing.
- DB-19 зафиксировал extraction rules: уникальные типы и цвета, без edges/frame semantics.
- Manifest v1 допускает список notation paths.

## Implementation Notes

- Notation extraction должен брать только то, что подтверждено docs: unique types and colors.
- Не переносите edges, layout или frame semantics в notation artifact.
- Текущая модель после связывания с notation должна остаться целой и открываемой.
- File placement для notation должен оставаться предсказуемым и читабельным.

## Files and Artifacts Expected to Change

- Notation creation UI/action.
- YAML serialization for notation files.
- Manifest update flow.
- Current-model binding to created notation.

## Acceptance Criteria for This Issue

- Из типизированной модели можно создать notation.
- Система извлекает уникальные типы и их цвета.
- В `notations/` появляется YAML-файл notation.
- Manifest обновляется ссылкой на notation.
- Текущая модель связывается с notation и не теряется.

## Required Tests

### Functional checks

- Создать notation из модели с несколькими типизированными нодами.
- Проверить содержимое notation file и manifest.
- Открыть исходную модель после связывания с notation.

### Smoke checks

- Повторить extraction flow на нескольких тестовых моделях.
- Проверить отсутствие crash при дублирующихся типах.

### Regression checks

- Убедиться, что late typing remains intact after notation creation.
- Проверить, что navigation flows и graph structure не сломаны.

### Persistence/reload checks

- Сохранить проект и переоткрыть его; notation file и manifest link должны восстановиться.
- Проверить, что исходная модель остается открываемой и не теряет данные.

## Handoff to Next Issue

### What now works

- Типизированная freeform-модель может породить reusable notation artifact.
- Project manifest знает о созданной notation.

### What contract is now stable

- Notation YAML v1 as type/color catalog.
- Model-to-notation binding after extraction.

### What next issue can start

- M4-03 может создавать typed models по существующей notation.
- M5-01 позже сможет включать notation artifacts в round-trip persistence validation.

## Done Definition

1. AC-10 выполняется полностью.
2. Notation file и manifest update переживают reopen.
3. Исходная диаграмма не теряется и не пересоздается.
4. Scope не уходит в notation editor or meta-model complexity.