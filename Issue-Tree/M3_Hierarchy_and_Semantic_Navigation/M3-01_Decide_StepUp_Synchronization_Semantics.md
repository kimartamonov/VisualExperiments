# [M3-01] Decide step-up synchronization semantics

## Metadata

- Issue ID: M3-01
- Type: Decision
- Status: Proposed
- Milestone: M3. Hierarchy and Semantic Navigation
- Capability Slice: CS-08. Step-up generation and upper-level navigation
- Priority: P0
- Sequence Order: 1
- Depends On:
  - M2-06
- Unlocks:
  - M3-02
  - M3-05
- Decision References:
  - DB-17
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

## Goal

- Зафиксировать MVP-семантику step-up без скрытой магии и без живой двусторонней синхронизации.
- Определить, как upper-level representation создается и когда обновляется.

## Why Now

- Нельзя корректно декомпозировать step-up implementation, пока не решено, one-shot это, manual regeneration или live sync.
- Риск R1 слишком высок, чтобы идти в implementation без явного выбора.
- Это главный blocking decision текущего milestone.

## User/System Outcome

- Пользователь получает предсказуемое поведение step-up и понимает, когда representation обновляется.
- Система фиксирует простую MVP-границу без live synchronization.
- Roadmap получает ясную основу для spike и implementation issues.

## Scope

- Сравнить варианты: one-time generation, manual regeneration/update, live sync.
- Зафиксировать MVP-решение: начальное создание + явная ручная регенерация/обновление позже, без live sync в первой версии.
- Описать, какие поля и ссылки являются частью step-up contract.
- Описать, что считается acceptably stale representation в MVP.

## Out of Scope

- Реализация UI и API step-up.
- Автоматическое обновление upper-level graph.
- Любая логика за пределами MVP, требующая real-time synchronization.

## Preconditions

- Frame contract из M2 стабилен.
- Cross-model links используют stable ids и относительные пути.
- Docs зафиксировали step-up как обязательную часть MVP demo path.

## Implementation Notes

- Следуйте рекомендации DB-17: live sync исключается из первой версии.
- Решение должно быть достаточно сильным для AC-8, но не тянуть post-MVP complexity.
- Отдельно зафиксируйте, что происходит при повторном запуске step-up для уже связанного frame.
- Запишите результат так, чтобы M3-05 мог получить конкретный DoD без новых вопросов.

## Files and Artifacts Expected to Change

- Decision backlog or related planning artifact.
- Step-up behavior notes and acceptance assumptions.
- Issue tree references for M3-05.

## Acceptance Criteria for This Issue

- Письменно зафиксирован выбор MVP-семантики step-up.
- Ясно описано, как создается верхнеуровневая модель и как трактуется повторный запуск операции.
- Следующий implementation issue может стартовать без двусмысленности по live sync.

## Required Tests

### Functional checks

- Проверить, что решение покрывает create upper-level model, navigate there and back, и повторный запуск step-up.

### Smoke checks

- Убедиться, что команда может коротко объяснить поведение step-up без дополнительных трактовок.

### Regression checks

- Проверить, что решение не противоречит DB-16, DB-18 и AC-8.
- Проверить, что решение не затягивает в MVP live sync or deep reconciliation scope.

## Handoff to Next Issue

### What now works

- Семантика step-up для MVP определена.
- Граница между generation и synchronization зафиксирована.

### What contract is now stable

- MVP rule: initial generation plus explicit manual regeneration/update later, no live sync.

### What next issue can start

- M3-02 может быстро проверить реализуемость выбранного подхода.
- M3-05 может строить implementation поверх зафиксированной semantics.

## Done Definition

1. Решение по DB-17 зафиксировано письменно.
2. Вариант live sync исключен из MVP critical path.
3. Повторный запуск step-up описан без двусмысленности.
4. M3-05 получил стабильную опору для DoD.