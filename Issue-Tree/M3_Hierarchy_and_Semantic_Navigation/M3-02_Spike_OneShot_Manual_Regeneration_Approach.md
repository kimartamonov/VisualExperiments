# [M3-02] Spike one-shot/manual regeneration approach for cross-model navigation

## Metadata

- Issue ID: M3-02
- Type: Spike
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-08. Step-up generation and upper-level navigation
- Priority: P0
- Sequence Order: 2
- Depends On:
  - M3-01
- Unlocks:
  - M3-03
  - M3-05
- Decision References:
  - DB-14
  - DB-16
  - DB-17
  - DB-18
- FR References:
  - FR-7.1
  - FR-7.2
  - FR-7.3
  - FR-10.2
  - FR-10.3
- AC References:
  - AC-8
- Demo References:
  - Step 6
  - Step 7
- Risk References:
  - R1
  - R4
  - R5

## Goal

- Быстро проверить техническую реализуемость выбранной step-up semantics и навигационного loop без лишней архитектурной нагрузки.
- Снизить риск неправильного design choice до начала полного implementation.

## Why Now

- Step-up технически самый рискованный slice milestone.
- Маленький spike дешевле, чем поздний rework после ошибочного implementation.
- Результат spike должен подтвердить, что manual regeneration path не конфликтует с React Flow и YAML round-trip.

## User/System Outcome

- Для пользователя это пока не новый production behavior, а гарантия, что следующий шаг пойдет по жизнеспособной траектории.
- Для системы появляется подтвержденный technical path для model creation, linking and back navigation.
- Для roadmap снимается существенная часть риска R1.

## Scope

- Проверить создание upper-level model file и representative node по stable ids.
- Проверить восстановление ссылки frame -> upper-level node и обратной навигации.
- Проверить, что выбранный подход не требует live sync runtime-state.
- Зафиксировать краткий вывод: берем / не берем / что нужно поправить в implementation notes.

## Out of Scope

- Production-ready UI/UX step-up.
- Полная реализация breadcrumbs/back stack.
- Создание нового обязательного scope beyond chosen spike question.

## Preconditions

- M3-01 зафиксировал MVP semantics.
- M2 обеспечил frame и stable model contracts.
- Path rules и relative references уже приняты.

## Implementation Notes

- Spike не должен превратиться в скрытый implementation issue.
- Достаточно узкого proof, который отвечает на вопрос реализуемости и round-trip integrity.
- Если spike выявляет новый blocking constraint, его нужно явно записать в planning artifacts.

## Files and Artifacts Expected to Change

- Spike notes or proof artifact.
- Decision backlog or implementation notes if уточнение необходимо.
- Small prototype code or disposable experiment notes, если это нужно для вывода.

## Acceptance Criteria for This Issue

- Сформулирован краткий вывод о жизнеспособности manual regeneration approach.
- Подтверждено, что frame-link -> upper-level model -> back navigation можно собрать без live sync.
- Все ограничения, найденные spike, оформлены письменно и не скрыты в голове команды.

## Required Tests

### Functional checks

- Проверить создание и чтение step-up ссылок на минимальном proof path.
- Проверить обратимость перехода на proof уровне.

### Smoke checks

- Убедиться, что approach не требует нестабильных runtime hacks.

### Regression checks

- Проверить, что вывод не противоречит M3-01 и существующей файловой модели.

### Persistence/reload checks

- Подтвердить, что proof round-trip через YAML не теряет link semantics.

## Handoff to Next Issue

### What now works

- Технический путь для step-up и cross-model navigation проверен на минимальном объеме.
- Критические ограничения реализации выявлены заранее.

### What contract is now stable

- Practical implementation notes for manual regeneration approach.

### What next issue can start

- M3-03 может реализовывать navigation context.
- M3-05 может строить step-up implementation без слепых зон по архитектуре.

## Done Definition

1. Spike завершен коротким письменным выводом.
2. Есть явное решение “берем / не берем” для выбранного подхода.
3. Новых скрытых implementation obligations не осталось.
4. Spike не разросся в production feature.