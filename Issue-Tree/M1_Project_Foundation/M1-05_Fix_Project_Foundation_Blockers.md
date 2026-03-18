# [M1-05] Fix project foundation blockers

## Metadata

- Issue ID: M1-05
- Type: Bugfix
- Status: Proposed
- Milestone: M1. Project Foundation
- Capability Slice: CS-02. Project tree and workspace shell
- Priority: P0
- Sequence Order: 5
- Depends On:
  - M1-04
- Unlocks:
  - M2-01
- Decision References:
  - DB-24
- FR References:
  - FR-1.1
  - FR-1.2
  - FR-1.3
  - FR-10.1
- AC References:
  - AC-1
  - AC-2
- Demo References:
  - Step 1
  - Step 2
- Risk References:
  - R5

## Goal

- Устранить critical/high defects, найденные в M1 validation, не расширяя scope milestone.
- Подготовить foundation layer к безопасному старту freeform-моделирования.

## Why Now

- M2 не должен наследовать нестабильность project bootstrap или workspace shell.
- Это обязательный bugfix slot после validation issue.
- Исправления должны быть локализованы до перехода к model/canvas behavior.

## User/System Outcome

- Пользователь получает устойчивый вход в рабочее пространство без блокеров.
- Система подтверждает, что foundation milestone выдерживает ручной acceptance pass.
- Roadmap может переходить к M2 без скрытого технического долга в первом экране продукта.

## Scope

- Исправить только defects, зафиксированные в M1-04 как critical/high.
- Повторно прогнать релевантные проверки AC-1 и AC-2 после фиксов.
- Обновить validation log при необходимости.

## Out of Scope

- Любые новые улучшения UX, не являющиеся blocker fixes.
- Добавление model lifecycle или canvas features.
- Рефакторинг ради красоты без влияния на acceptance.

## Preconditions

- M1-04 завершен и содержит findings.
- Для каждого фикса есть понятный reproduction path.
- Scope bugfix ограничен границами M1.

## Implementation Notes

- Каждый fix должен быть трассируем до конкретного finding из M1-04.
- Если обнаруживается, что проблема на самом деле скрывает новый обязательный capability, ее нужно вынести отдельно, а не маскировать под bugfix.
- После фикса обязательно перепроверьте входной сценарий целиком.

## Files and Artifacts Expected to Change

- Foundation UI/backend components, затронутые найденными defects.
- Validation artifacts for rerun results.
- Smoke-check evidence for release gate to M2.

## Acceptance Criteria for This Issue

- Все critical/high blockers из M1-04 либо исправлены, либо явно эскалированы как отдельный управляемый риск.
- Повторный проход AC-1 и AC-2 не выявляет blocker-level regressions.
- Milestone M1 имеет понятный exit signal для перехода в M2.

## Required Tests

### Functional checks

- Повторить все шаги, которые воспроизводили найденные blockers.
- Повторить полный foundation flow create -> open -> workspace.

### Smoke checks

- Проверить, что фикс не ломает соседние foundation behaviors.
- Повторить сценарий минимум два раза подряд.

### Regression checks

- Убедиться, что create/open project и file tree по-прежнему работают вместе.
- Проверить, что фиксы не меняют manifest/file placement contract без явного решения.

### Persistence/reload checks

- Перепроверить reopen проекта после внесенных исправлений.

## Handoff to Next Issue

### What now works

- Foundation milestone не содержит blocker-level дефектов.
- Create/open project и workspace shell устойчивы для следующего блока работ.

### What contract is now stable

- Входной пользовательский путь M1 считается базово принятым.

### What next issue can start

- M2-01 может начинать model lifecycle and freeform bootstrap.

## Done Definition

1. Все blocker fixes привязаны к findings M1-04.
2. Повторная проверка foundation flow проходит.
3. Не добавлен новый scope за пределами M1.
4. Команда может переходить к M2 без дополнительных foundation-task'ов.