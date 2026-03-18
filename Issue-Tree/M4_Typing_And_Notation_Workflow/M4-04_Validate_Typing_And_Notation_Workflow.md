# [M4-04] Validate typing and notation workflow

## Metadata

- Issue ID: M4-04
- Type: Validation
- Status: Proposed
- Milestone: M4. Typing and Notation Workflow
- Capability Slice: CS-10. Late typing in freeform models
- Priority: P0
- Sequence Order: 4
- Depends On:
  - M4-01
  - M4-02
  - M4-03
- Unlocks:
  - M4-05
  - M5-01
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

- Подтвердить, что типизация, notation extraction и typed model creation работают как единый пользовательский цикл.
- Зафиксировать blockers до перехода к финальному persistence and demo milestone.

## Why Now

- M5 должен заниматься устойчивостью и финальной приемкой, а не вылавливать базовые дефекты M4.
- Validation issue обязателен, чтобы проверить не отдельные части, а весь semantic workflow целиком.
- Этот issue формально закрывает exit criteria M4.

## User/System Outcome

- Пользователь может пройти путь от late typing до typed model без внешних обходов.
- Система подтверждает, что notation действительно служит мостом между freeform и typed mode.
- Roadmap получает clear gate на запуск full persistence integrity work.

## Scope

- Ручной проход AC-9, AC-10 и AC-11.
- Проверка demo steps 10-13 как непрерывного сценария.
- Базовая проверка reopen для типизированной модели и notation artifacts.
- Фиксация pass/fail и списка blocker findings.

## Out of Scope

- Исправление найденных defects внутри validation issue.
- Полный final demo pass по всем 14 шагам.
- Улучшения beyond current typing/notation scope.

## Preconditions

- Все implementation issues M4 завершены.
- В проекте есть тестовая freeform-модель с типизированными нодами и хотя бы одна notation.
- Navigation и model persistence базово работают.

## Implementation Notes

- Проверяйте M4 как единый semantic loop: assign types -> create notation -> create typed model.
- Findings должны быть привязаны к AC or demo step.
- Отдельно фиксируйте, не ломает ли late typing existing graph structure.

## Files and Artifacts Expected to Change

- Validation checklist and acceptance log.
- Demo evidence for steps 10-13.
- Bug list for M4-05.

## Acceptance Criteria for This Issue

- AC-9, AC-10 и AC-11 вручную проверены.
- Demo steps 10-13 проходят одной связной последовательностью.
- Базовый reopen подтверждает сохранность typing and notation artifacts.
- Все critical/high findings оформлены как blockers для M4 exit.

## Required Tests

### Functional checks

- Назначить типы, создать notation, создать typed model, добавить typed nodes.
- Проверить корректность конечного состояния всех артефактов.

### Smoke checks

- Повторить workflow минимум два раза на двух моделях.
- Проверить отсутствие аварийных завершений и потери контекста.

### Regression checks

- Убедиться, что M2/M3 flows по-прежнему доступны.
- Проверить, что navigation и graph structure не ломаются после M4 operations.

### Persistence/reload checks

- Переоткрыть проект и проверить позднюю типизацию, notation и typed model references.

## Handoff to Next Issue

### What now works

- Typing/notation workflow проверен как end-to-end path.
- Известные blockers, если есть, явно зафиксированы.

### What contract is now stable

- Semantic bridge freeform -> notation -> typed model.

### What next issue can start

- M4-05 может закрыть blockers.
- После M4 exit M5-01 может запускать full round-trip persistence validation.

## Done Definition

1. Validation result оформлен письменно.
2. Demo steps 10-13 проверены целиком.
3. Нет незафиксированных blocker-level defects.
4. Переход к M5 либо разрешен, либо остановлен с ясным списком причин.