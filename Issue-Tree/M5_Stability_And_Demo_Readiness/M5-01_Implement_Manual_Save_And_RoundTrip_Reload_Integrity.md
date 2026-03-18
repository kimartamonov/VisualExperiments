# [M5-01] Implement manual save and round-trip reload integrity

## Metadata

- Issue ID: M5-01
- Type: Implementation
- Status: Proposed
- Milestone: M5. Stability and Demo Readiness
- Capability Slice: CS-13. Save, reload and persistence integrity
- Priority: P0
- Sequence Order: 1
- Depends On:
  - M4-05
- Unlocks:
  - M5-02
  - M5-03
  - M5-04
- Decision References:
  - DB-03
  - DB-15
  - DB-21
- FR References:
  - FR-2.6
  - FR-11.1
  - FR-11.2
- AC References:
  - AC-12
- Demo References:
  - Step 14
- Risk References:
  - R5
  - R6
  - R7

## Goal

- Сделать reliable manual save основным MVP-path и обеспечить round-trip reopen без потери структуры проекта.
- Стабилизировать сохранение всех обязательных артефактов: models, nodes, edges, frames, drill-down, step-up, typing and notation references.

## Why Now

- Документы явно требуют не откладывать save/reload integrity, если feature уже меняет data model.
- Финальная приемка невозможна, если reopen разрушает структуру проекта.
- Этот issue создает основу для final demo acceptance и error handling validation.

## User/System Outcome

- Пользователь может явно сохранить проект и затем переоткрыть его без потери work state на уровне доменных данных.
- Система устойчиво сериализует и восстанавливает все MVP-сущности из YAML.
- Roadmap получает главный data-integrity gate перед full demo pass.

## Scope

- Реализовать или довести до надежности manual save path.
- Обеспечить reopen project/model round-trip для всех P0 artifacts.
- Проверить round-trip для nodes, edges, frames, drill-down, step-up, typing, notation, typed models.
- Отделить persisted data от transient runtime-state в соответствии с DB-15.

## Out of Scope

- Autosave как обязательный MVP feature.
- Conflict resolution beyond last-write-wins.
- Version history or migration platform.

## Preconditions

- Все P0 features M1-M4 реализованы.
- YAML остается source of truth.
- Acceptance policy признает manual save достаточным MVP-path.

## Implementation Notes

- Ручное сохранение является обязательной основой; autosave может остаться post-MVP/optional.
- В YAML должны попадать только доменные данные и координаты, но не transient UI state вроде selection и runtime breadcrumbs stack.
- Особое внимание уделите cross-model references и notation registration in manifest.
- Проверки reopen должны идти не только на happy path модели, но и на проект целиком.

## Files and Artifacts Expected to Change

- Save/open orchestration in backend and frontend.
- YAML serialization/deserialization across all core entities.
- Manual save UI/action.
- Round-trip test assets or acceptance checklist.

## Acceptance Criteria for This Issue

- Пользователь может явно сохранить проект.
- После reopen сохраняются все модели, nodes, edges, frames, drill-down, step-up, types, notations и typed models.
- Структура проекта не нарушается и ссылки остаются рабочими.
- Transient UI state не становится обязательной частью persisted schema.

## Required Tests

### Functional checks

- Выполнить manual save после набора изменений в проекте.
- Переоткрыть проект и проверить доступность всех артефактов.

### Smoke checks

- Повторить save/reopen цикл несколько раз подряд.
- Проверить отсутствие crash при reopening проекта с несколькими моделями.

### Regression checks

- Убедиться, что все M1-M4 capability slices по-прежнему работают после round-trip.
- Проверить, что save не ломает navigation flows and notation references.

### Persistence/reload checks

- Проверить round-trip для каждой сущности MVP.
- Проверить сохранность relative paths, ids and manifest links.

## Handoff to Next Issue

### What now works

- Проект выдерживает базовый round-trip save/reopen across full MVP scope.
- Data integrity становится подтверждаемой, а не предполагаемой.

### What contract is now stable

- Manual save as mandatory MVP path.
- Persisted-vs-transient boundary for project data.

### What next issue can start

- M5-02 может добавлять file-based recovery behavior поверх стабильного round-trip.
- M5-03 и M5-04 могут валидировать acceptance на реальном data set.

## Done Definition

1. AC-12 выполняется полностью.
2. Round-trip reopen проверен для всех P0 artifacts.
3. Manual save path устойчив и воспроизводим.
4. Autosave не является скрытым блокером MVP.