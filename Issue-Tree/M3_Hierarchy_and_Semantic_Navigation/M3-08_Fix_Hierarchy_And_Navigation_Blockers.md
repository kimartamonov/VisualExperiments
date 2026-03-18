# [M3-08] Fix hierarchy and navigation blockers

## Metadata

- Issue ID: M3-08
- Type: Bugfix
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-08. Step-up generation and upper-level navigation
- Priority: P0
- Sequence Order: 8
- Depends On:
  - M3-07
- Unlocks:
  - M4-01
  - M5-01
  - M5-02
- Decision References:
  - DB-24
- FR References:
  - FR-6.1
  - FR-6.2
  - FR-6.3
  - FR-6.4
  - FR-6.5
  - FR-7.1
  - FR-7.2
  - FR-7.3
  - FR-10.2
  - FR-10.3
- AC References:
  - AC-7
  - AC-8
- Demo References:
  - Step 6
  - Step 7
  - Step 8
  - Step 9
- Risk References:
  - R1
  - R4
  - R5

## Goal

- Устранить critical/high defects, найденные в M3 validation, не размывая границы milestone.
- Подготовить cross-model semantics к использованию в typing and persistence milestones.

## Why Now

- Неустойчивая навигация разрушит дальнейший M4/M5 acceptance path.
- Bugfix slot после M3 validation обязателен, чтобы явно закрыть blockers.
- Исправления сейчас дешевле, чем после добавления typing and notation links.

## User/System Outcome

- Пользователь получает надежный reversible navigation flow.
- Система удерживает целостность cross-model links перед новыми слоями данных.
- Roadmap может переходить к M4 без возврата в незавершенные navigation issues.

## Scope

- Исправить только blockers из M3-07.
- Перепроверить AC-7/AC-8 и demo steps 6-9 после фиксов.
- Обновить validation notes rerun result.

## Out of Scope

- Новые navigation features beyond findings.
- Typing/notation implementation.
- Большой рефакторинг без влияния на acceptance.

## Preconditions

- M3-07 завершен и содержит findings.
- Для каждого defect есть воспроизводимый сценарий.
- M3 feature scope считается закрытым.

## Implementation Notes

- Каждый bugfix должен быть напрямую связан с finding из validation.
- Если проблема вскрывает новый обязательный decision, его нужно явно выделить, а не прятать в кодовом фиксe.
- После фиксов повторно проверьте оба направления переходов и broken-link handling.

## Files and Artifacts Expected to Change

- Navigation and cross-model code paths, затронутые findings.
- Validation rerun artifacts.
- Acceptance notes for M3 exit.

## Acceptance Criteria for This Issue

- Все critical/high blockers из M3-07 устранены или явно эскалированы.
- Повторный проход AC-7 и AC-8 не показывает blocker-level regressions.
- M3 exit criteria считаются выполненными.

## Required Tests

### Functional checks

- Повторить все шаги, которые воспроизводили blockers.
- Пройти полный step-up/drill-down navigation loop после фиксов.

### Smoke checks

- Повторить переходы между уровнями несколько раз подряд.
- Проверить отсутствие crash и потери context.

### Regression checks

- Убедиться, что M2 behaviors не сломаны.
- Проверить, что drill-down, step-up и multiple drill-down не конфликтуют друг с другом.

### Persistence/reload checks

- Повторно проверить базовую восстановимость cross-model links.

### Navigation checks

- Проверить breadcrumbs/back и recovery path после фиксов.

## Handoff to Next Issue

### What now works

- Hierarchy/navigation milestone не содержит blocker-level дефектов.
- Cross-model loops готовы стать базой для typed and notation workflows.

### What contract is now stable

- M3 navigation and link semantics.

### What next issue can start

- M4-01 может реализовывать late typing.
- M5-01 и M5-02 позже смогут включать M3 links в round-trip и recovery validation.

## Done Definition

1. Все fixes привязаны к findings M3-07.
2. Повторная проверка M3 flow проходит.
3. Новый scope не добавлен.
4. Команда может переходить к M4 без возврата к hidden M3 blockers.