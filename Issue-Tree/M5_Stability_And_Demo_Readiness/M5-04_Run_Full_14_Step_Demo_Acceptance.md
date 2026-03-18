# [M5-04] Run full 14-step demo acceptance

## Metadata

- Issue ID: M5-04
- Type: Validation
- Status: Proposed
- Milestone: M5. Stability and Demo Readiness
- Capability Slice: CS-15. Demo hardening and acceptance pass
- Priority: P0
- Sequence Order: 4
- Depends On:
  - M5-03
- Unlocks:
  - M5-05
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
  - R7

## Goal

- Пройти и задокументировать полный 14-step demo scenario как основной критерий приемки MVP.
- Выявить критические и высокие дефекты, которые реально блокируют продуктовую приемку.

## Why Now

- Документы делают именно demo scenario главным критерием готовности продукта.
- После локальной валидации всех milestone можно проверить продукт как единое целое.
- Этот issue отделяет продуктовую приемку от частных technical checks.

## User/System Outcome

- Заказчик может пройти весь путь от создания проекта до reopen без внешних обходов.
- Система демонстрирует, что MVP работает как цельный инструмент, а не набор отдельных возможностей.
- Roadmap получает финальный список blockers до MVP sign-off.

## Scope

- Пройти все 14 шагов demo scenario в заданной последовательности.
- Сопоставить каждый шаг ожидаемому результату и check column из docs.
- Зафиксировать pass/fail и severity каждого найденного дефекта.
- Сформировать итоговый acceptance report.

## Out of Scope

- Исправление дефектов внутри validation issue.
- Добавление новых features вне текущего MVP.
- P1-polish, не влияющий на прохождение demo scenario.

## Preconditions

- M5-03 завершил baseline persistence and recovery validation.
- Все milestone M1-M4 и базовые M5 slices закрыты локально.
- Подготовлен demo project/use case, достаточный для прохождения 14 шагов.

## Implementation Notes

- Оценивайте именно сквозной пользовательский путь, а не отдельные технические подсистемы.
- Severity findings должна соответствовать rules из acceptance strategy: critical/high issues блокируют приемку.
- Отчет должен позволять однозначно понять, готов ли MVP к sign-off.

## Files and Artifacts Expected to Change

- Final demo acceptance log.
- Demo evidence for all 14 steps.
- Blocker list for M5-05.
- Release readiness notes.

## Acceptance Criteria for This Issue

- Все 14 demo steps пройдены и зафиксированы.
- Для каждого шага есть результат pass/fail и краткая заметка.
- Все critical/high defects оформлены как конкретные blockers.
- Ясно определено, готов ли MVP к приемке заказчиком.

## Required Tests

### Functional checks

- Пройти шаги 1-14 в порядке из docs.
- Сопоставить результат каждого шага ожидаемому outcome.

### Smoke checks

- Проверить отсутствие crash или data loss на протяжении полного сценария.

### Regression checks

- Убедиться, что переход между milestone behaviors не ломает предыдущие шаги.

### Persistence/reload checks

- Отдельно подтвердить Step 14 на реальном наборе данных после прохождения Steps 1-13.

### Manual scenario checks

- Сформировать итоговый список критических и высоких blocker defects.

## Handoff to Next Issue

### What now works

- Полный MVP проверен как единая продуктовая история.
- Все blockers к sign-off формально известны.

### What contract is now stable

- Acceptance baseline for final MVP readiness.

### What next issue can start

- M5-05 может устранить критические и высокие blockers из финального acceptance pass.

## Done Definition

1. Все 14 шагов проверены и задокументированы.
2. Severity findings классифицированы по правилам docs.
3. Ясно, проходит ли MVP финальную приемку.
4. Ни один blocker не остается незафиксированным.