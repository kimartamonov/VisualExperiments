# [M2-06] Fix freeform workflow blockers

## Metadata

- Issue ID: M2-06
- Type: Bugfix
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-06. Frame as semantic container
- Priority: P0
- Sequence Order: 6
- Depends On:
  - M2-05
- Unlocks:
  - M3-01
  - M3-03
  - M3-05
- Decision References:
  - DB-24
- FR References:
  - FR-2.1
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
  - FR-5.4
- AC References:
  - AC-3
  - AC-4
  - AC-5
  - AC-6
- Demo References:
  - Step 3
  - Step 4
  - Step 5
- Risk References:
  - R5

## Goal

- Устранить blocker-level defects, найденные в freeform workflow validation.
- Подготовить редактор диаграмм к безопасному добавлению cross-model semantics.

## Why Now

- Hierarchy features резко увеличат стоимость диагностики, если freeform foundation уже нестабилен.
- Bugfix issue должен завершить milestone после validation, не добавляя новый scope.
- Это последний контроль качества перед переходом в M3.

## User/System Outcome

- Пользователь получает устойчивый freeform editing path без критических блокеров.
- Система подтверждает, что graph editing и persistence работают как единый фундамент.
- Roadmap может переходить к drill-down и step-up без скрытых дефектов M2.

## Scope

- Исправить только critical/high findings из M2-05.
- Перепроверить релевантные AC и demo steps после фиксов.
- Обновить validation notes по результату rerun.

## Out of Scope

- Новые freeform features вне списка findings.
- Инициативы M3/M4.
- Рефакторинг без влияния на acceptance.

## Preconditions

- M2-05 завершен и содержит findings.
- Для каждого дефекта известен reproduction path.
- M2 scope закрыт и не требует новых capability issues.

## Implementation Notes

- Каждый fix должен быть привязан к конкретному finding из validation.
- Если проблема вскрывает отсутствующую обязательную capability, не маскируйте ее под bugfix.
- После фиксов перепройдите минимальный интеграционный сценарий M2 целиком.

## Files and Artifacts Expected to Change

- Graph editor code paths, затронутые findings.
- Validation artifacts for rerun.
- Acceptance log for M2 exit.

## Acceptance Criteria for This Issue

- Все critical/high blockers из M2-05 устранены или явно эскалированы.
- Повторный проход AC-3..AC-6 не показывает blocker-level regressions.
- M2 exit criteria формально считаются выполненными.

## Required Tests

### Functional checks

- Повторить сценарии, которые воспроизводили blockers.
- Пройти create model -> nodes -> edges -> frame flow после фиксов.

### Smoke checks

- Выполнить M2 workflow минимум два раза подряд.
- Проверить отсутствие crash на базовом наборе операций.

### Regression checks

- Убедиться, что foundation flow M1 не сломан.
- Проверить, что исправления не ломают сохранение/открытие моделей.

### Persistence/reload checks

- Повторно проверить reopen модели с nodes, edges и frames.

## Handoff to Next Issue

### What now works

- Freeform workflow локально принят и не содержит blocker-level дефектов.
- Diagram editor готов к добавлению hierarchy/navigation behavior.

### What contract is now stable

- M2 model contract и базовый graph editing workflow.

### What next issue can start

- M3-01 может принимать step-up semantics decision.
- M3-03 и M3-05 позже смогут использовать стабильные nodes/frames как основу.

## Done Definition

1. Все fixes привязаны к findings M2-05.
2. Повторная проверка freeform workflow проходит.
3. Новый scope не добавлен.
4. M3 можно начинать без возвращения к M2 foundation.