# [M4-05] Fix typing and notation blockers

## Metadata

- Issue ID: M4-05
- Type: Bugfix
- Status: Proposed
- Milestone: M4. Typing and Notation Workflow
- Capability Slice: CS-12. Typed model creation from notation
- Priority: P0
- Sequence Order: 5
- Depends On:
  - M4-04
- Unlocks:
  - M5-01
  - M5-04
- Decision References:
  - DB-24
- FR References:
  - FR-8.1
  - FR-8.2
  - FR-8.3
  - FR-2.2
  - FR-9.1
  - FR-9.2
- AC References:
  - AC-9
  - AC-10
  - AC-11
- Demo References:
  - Step 10
  - Step 11
  - Step 12
  - Step 13
- Risk References:
  - R7
  - R5

## Goal

- Устранить blockers, найденные в M4 validation, и стабилизировать semantic workflow до финального hardening milestone.
- Не допустить, чтобы M5 тратил силы на незакрытые базовые defects typing/notation flow.

## Why Now

- Финальная приемка невозможна, если broken foundation остается в typing and notation loop.
- Bugfix issue после validation обязателен для формального выхода milestone.
- Исправления сейчас дешевле, чем после включения full save/reload and acceptance pass.

## User/System Outcome

- Пользователь получает устойчивый путь от типизации к typed model.
- Система удерживает notation artifacts и typed references без blocker-level дефектов.
- Roadmap может переходить к M5 с доверенным semantic core.

## Scope

- Исправить только findings из M4-04 уровня critical/high.
- Перепроверить AC-9..AC-11 и demo steps 10-13.
- Обновить validation notes rerun result.

## Out of Scope

- Новые features beyond findings.
- Улучшения notation editor, rule engine или additional type management.
- Большой рефакторинг ради архитектурной чистоты.

## Preconditions

- M4-04 завершен и содержит findings.
- Для каждого defect есть воспроизводимый path.
- M4 scope зафиксирован и не требует новых capability issues.

## Implementation Notes

- Каждый fix должен быть связан с finding из M4-04.
- Если defect скрывает новый обязательный contract change, это нужно явно записать, а не прятать внутри bugfix.
- После фиксов повторно проверьте не только happy path, но и reopen behavior.

## Files and Artifacts Expected to Change

- Typing/notation/typed-model code paths, затронутые findings.
- Validation rerun artifacts.
- Acceptance notes for M4 exit.

## Acceptance Criteria for This Issue

- Все critical/high blockers из M4-04 устранены или явно эскалированы.
- Повторный проход AC-9..AC-11 не показывает blocker-level regressions.
- M4 exit criteria считаются выполненными.

## Required Tests

### Functional checks

- Повторить все сценарии, которые воспроизводили blockers.
- Пройти полный typing -> notation -> typed model loop после фиксов.

### Smoke checks

- Повторить workflow минимум два раза подряд.
- Проверить отсутствие crash и потери артефактов.

### Regression checks

- Убедиться, что M2/M3 flows не сломаны.
- Проверить, что notation files и typed models по-прежнему совместимы между собой.

### Persistence/reload checks

- Повторно проверить reopen проекта с notation и typed models.

## Handoff to Next Issue

### What now works

- M4 semantic workflow больше не содержит blocker-level дефектов.
- Core product hypothesis реализована на рабочем уровне.

### What contract is now stable

- M4 contracts for late typing, notation extraction and typed model creation.

### What next issue can start

- M5-01 может строить full persistence integrity across all slices.
- M5-04 позже сможет включать M4 path в final 14-step demo acceptance.

## Done Definition

1. Все fixes привязаны к findings M4-04.
2. Повторная проверка M4 workflow проходит.
3. Новый scope не добавлен.
4. Команда может переходить к M5 без скрытых M4 blockers.