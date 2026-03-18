# [M5-05] Fix critical and high acceptance blockers

## Metadata

- Issue ID: M5-05
- Type: Bugfix
- Status: Proposed
- Milestone: M5. Stability and Demo Readiness
- Capability Slice: CS-15. Demo hardening and acceptance pass
- Priority: P0
- Sequence Order: 5
- Depends On:
  - M5-03
  - M5-04
- Unlocks:
  - MVP sign-off
- Decision References:
  - DB-24
- FR References:
  - FR-1.1
  - FR-1.2
  - FR-1.3
  - FR-2.1
  - FR-2.2
  - FR-2.3
  - FR-2.6
  - FR-3.1
  - FR-3.2
  - FR-3.3
  - FR-3.4
  - FR-3.5
  - FR-4.1
  - FR-4.3
  - FR-5.1
  - FR-5.2
  - FR-5.3
  - FR-6.1
  - FR-6.2
  - FR-6.3
  - FR-6.4
  - FR-7.1
  - FR-7.2
  - FR-7.3
  - FR-8.1
  - FR-8.2
  - FR-8.3
  - FR-9.1
  - FR-9.2
  - FR-10.1
  - FR-10.2
  - FR-10.3
  - FR-11.1
  - FR-11.2
- AC References:
  - AC-1
  - AC-2
  - AC-3
  - AC-4
  - AC-5
  - AC-6
  - AC-7
  - AC-8
  - AC-9
  - AC-10
  - AC-11
  - AC-12
  - AC-13
- Demo References:
  - Step 1
  - Step 2
  - Step 3
  - Step 4
  - Step 5
  - Step 6
  - Step 7
  - Step 8
  - Step 9
  - Step 10
  - Step 11
  - Step 12
  - Step 13
  - Step 14
- Risk References:
  - R1
  - R4
  - R5
  - R6
  - R7

## Goal

- Устранить только те defects, которые по результатам final acceptance реально блокируют MVP sign-off.
- Довести продукт до состояния, в котором 14-step demo path проходит без critical/high blockers.

## Why Now

- Это последний bugfix slot после полной интеграционной приемки.
- Исправления должны быть строго сфокусированы на blocker-level findings, иначе milestone расползется в endless polish.
- После этого issue должен быть понятен сигнал “MVP ready” или остаточный риск.

## User/System Outcome

- Заказчик получает версию, пригодную для ручной приемки по основному сценарию.
- Система закрывает blocker defects без размывания scope.
- Roadmap получает финальную точку выхода MVP.

## Scope

- Исправить critical/high findings из M5-03 и M5-04.
- Перепроверить затронутые шаги demo scenario и AC.
- Обновить финальный acceptance report.

## Out of Scope

- Medium/low cosmetic polish, не влияющий на sign-off.
- Новые features или optional slices.
- Большие архитектурные переработки, не нужные для прохождения demo path.

## Preconditions

- M5-03 и M5-04 завершены и содержат findings.
- Для каждого blocker есть ясный reproduction path и severity.
- Product scope MVP считается замороженным.

## Implementation Notes

- Каждый fix должен быть привязан к конкретному acceptance blocker.
- Если выясняется, что blocker невозможен к устранению без существенного расширения scope, это должно быть явно зафиксировано как residual risk, а не замаскировано под незавершенную работу.
- После фиксов перепроверяйте именно те шаги сценария, которые были затронуты, и при необходимости rerun full demo.

## Files and Artifacts Expected to Change

- Любые code/data paths, затронутые финальными blockers.
- Final acceptance report and rerun evidence.
- MVP readiness note.

## Acceptance Criteria for This Issue

- Все critical/high blockers из M5-03 и M5-04 устранены либо формально эскалированы как остаточный риск с понятной причиной.
- Повторная проверка затронутых AC и demo steps не показывает blocker-level regressions.
- MVP либо проходит финальную приемку, либо остаточный отказ объяснен конкретно и письменно.

## Required Tests

### Functional checks

- Повторить все сценарии, которые воспроизводили blockers.
- При необходимости повторить полный 14-step demo path.

### Smoke checks

- Проверить отсутствие новых critical failures после fixes.

### Regression checks

- Убедиться, что фиксы не ломают соседние milestone behaviors.

### Persistence/reload checks

- Перепроверить Step 14 и затронутые round-trip paths.

### Manual scenario checks

- Обновить итоговый sign-off report с pass/fail status.

## Handoff to Next Issue

### What now works

- Финальные blocker defects закрыты или формально зафиксированы как остаточный риск.
- MVP готов к sign-off при условии отсутствия blocker-level findings.

### What contract is now stable

- Final acceptance state of the MVP.

### What next issue can start

- Основной MVP roadmap завершен.
- Любые следующие задачи должны идти уже как post-MVP backlog, а не как скрытое продолжение этого issue tree.

## Done Definition

1. Все fixes привязаны к blocker findings final acceptance.
2. Повторная проверка показывает отсутствие unresolved critical/high blockers.
3. Финальный acceptance status оформлен письменно.
4. MVP имеет четкий выход: sign-off или конкретно описанный residual risk.