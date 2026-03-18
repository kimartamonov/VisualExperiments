# [M5-03] Validate persistence and recovery

## Metadata

- Issue ID: M5-03
- Type: Validation
- Status: Proposed
- Milestone: M5. Stability and Demo Readiness
- Capability Slice: CS-13. Save, reload and persistence integrity
- Priority: P0
- Sequence Order: 3
- Depends On:
  - M5-01
  - M5-02
- Unlocks:
  - M5-04
  - M5-05
- Decision References:
  - DB-24
- FR References:
  - FR-2.6
  - FR-11.1
  - FR-11.2
- AC References:
  - AC-12
  - AC-13
- Demo References:
  - Step 14
- Risk References:
  - R5
  - R6
  - R7

## Goal

- Проверить, что save/reopen integrity и recovery behavior работают вместе на реальных данных проекта.
- Зафиксировать blockers до запуска финального 14-step acceptance pass.

## Why Now

- Final demo pass не должен смешиваться с базовой проверкой persistence and unhappy paths.
- Milestone обязан иметь validation issue до финального acceptance gate.
- Этот issue отделяет structural integrity defects от end-to-end demo blockers.

## User/System Outcome

- Пользователь получает подтверждение, что проект переживает reopen и сбойные файлы без структурной катастрофы.
- Система показывает согласованность happy-path and unhappy-path behaviors.
- Roadmap получает clear input для финального demo pass.

## Scope

- Ручной проход AC-12 и AC-13.
- Проверка round-trip reopen for full project.
- Проверка invalid YAML, missing link and missing notation fallbacks.
- Фиксация pass/fail и blocker findings.

## Out of Scope

- Исправление найденных defects внутри validation.
- Полный 14-step demo scenario как отдельный acceptance gate.
- New feature work outside M5 slices.

## Preconditions

- M5-01 и M5-02 завершены.
- Подготовлен тестовый проект с полным набором сущностей и несколькими failure cases.
- Happy-path M1-M4 уже локально принят.

## Implementation Notes

- Проверяйте не только отдельные файлы, но и проект как целое.
- Findings должны быть классифицированы по severity и связаны с AC-12/AC-13.
- Validation не должен превращаться в повторную декомпозицию продукта.

## Files and Artifacts Expected to Change

- Validation checklist and acceptance log.
- Test data for invalid YAML and broken references.
- Bug list for M5-05.

## Acceptance Criteria for This Issue

- AC-12 и AC-13 вручную проверены.
- Full-project reopen показывает сохранность структуры.
- Recovery paths подтверждены и задокументированы.
- Все critical/high findings оформлены как blockers для final acceptance.

## Required Tests

### Functional checks

- Сохранить и открыть проект с полным набором сущностей.
- Воспроизвести invalid YAML and missing-link scenarios.

### Smoke checks

- Повторить save/reopen and error-recovery checks несколько раз.
- Проверить отсутствие crash при смешанном наборе valid and invalid artifacts.

### Regression checks

- Убедиться, что happy-path flows M1-M4 не сломаны.
- Проверить, что error handling не ломает обычное открытие проекта.

### Persistence/reload checks

- Проверить round-trip для всех core entities.
- Проверить, что links and notation references не теряют целостность.

## Handoff to Next Issue

### What now works

- Persistence and recovery проверены на интеграционном уровне.
- Известные blockers, если есть, явно зафиксированы.

### What contract is now stable

- M5 baseline integrity and recovery behavior.

### What next issue can start

- M5-04 может запускать полный 14-step demo acceptance.
- M5-05 может позже закрывать blocker findings из validation and final demo.

## Done Definition

1. Validation result оформлен письменно.
2. AC-12 и AC-13 проверены.
3. Нет незафиксированных blocker-level defects.
4. Final acceptance pass может стартовать с понятным baseline quality.