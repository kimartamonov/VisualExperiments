# [M3-07] Validate hierarchy and semantic navigation

## Metadata

- Issue ID: M3-07
- Type: Validation
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-07. Drill-down creation and navigation
- Priority: P0
- Sequence Order: 7
- Depends On:
  - M3-03
  - M3-04
  - M3-05
  - M3-06
- Unlocks:
  - M3-08
  - M4-01
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

- Подтвердить, что hierarchy/navigation milestone работает как единый обратимый semantic flow.
- Зафиксировать blockers до начала typing and notation workflow.

## Why Now

- Typing workflow не должен начинаться на нестабильной cross-model navigation.
- M3 обязан завершиться интеграционной validation, а не суммой локальных happy paths.
- Этот issue формально закрывает exit criteria milestone.

## User/System Outcome

- Пользователь может пройти step-up и drill-down loops с возвратом.
- Система подтверждает целостность cross-model links, back stack и breadcrumbs.
- Roadmap получает clear gate на переход к M4.

## Scope

- Ручной проход AC-7 и AC-8.
- Проверка demo steps 6-9.
- Отдельная проверка multi-drilldown UX и broken-link recovery на базовом уровне.
- Фиксация pass/fail и списка blocker findings.

## Out of Scope

- Исправление найденных defects внутри validation issue.
- Typing, notation или save/reload hardening beyond M3 scope.
- UX-polish, не блокирующий acceptance.

## Preconditions

- Все M3 implementation/refinement issues завершены.
- Подготовлен тестовый проект с frame, child models и upper-level model.
- Navigation context работает на рабочем окружении.

## Implementation Notes

- Проверяйте M3 как связный navigation loop, а не как независимые features.
- Каждому finding сопоставляйте конкретный AC/demo step.
- Broken-link checks должны оцениваться как часть reliability path, но без расширения в M5 full hardening scope.

## Files and Artifacts Expected to Change

- Validation checklist and acceptance log.
- Demo evidence for steps 6-9.
- Bug list for M3-08.

## Acceptance Criteria for This Issue

- AC-7 и AC-8 проверены вручную.
- Demo steps 6-9 проходят связно и обратимо.
- Multiple drill-down не ломает основной navigation path.
- Все critical/high findings зафиксированы как blockers для M3 exit.

## Required Tests

### Functional checks

- Пройти step-up flow и вернуться назад.
- Пройти drill-down flow и вернуться назад.
- Проверить multiple drill-down selection and open.

### Smoke checks

- Повторить navigation loops несколько раз подряд.
- Проверить отсутствие crash при последовательных переходах между уровнями.

### Regression checks

- Убедиться, что M2 freeform editing не сломан после navigation features.
- Проверить, что workspace shell и file tree остаются работоспособными.

### Persistence/reload checks

- Базово проверить сохранность ссылок после reopen до начала полного M5 hardening.

### Navigation checks

- Проверить breadcrumbs и back для обоих направлений перехода.
- Проверить missing-target recovery path.

## Handoff to Next Issue

### What now works

- Hierarchy/navigation flow проверен как единое поведение.
- Известные blockers, если есть, явно зафиксированы.

### What contract is now stable

- Cross-model navigation behavior для MVP.
- Link semantics for drill-down and step-up.

### What next issue can start

- M3-08 может закрыть blockers.
- После успешного выхода milestone M4-01 может запускать late typing.

## Done Definition

1. Validation result оформлен письменно.
2. Demo steps 6-9 проверены end-to-end.
3. Нет незафиксированных blocker-level defects.
4. Переход к M4 либо разрешен, либо остановлен с конкретными findings.