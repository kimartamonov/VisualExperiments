# [M5-02] Implement error handling and recovery fallbacks

## Metadata

- Issue ID: M5-02
- Type: Implementation
- Status: Proposed
- Milestone: M5. Stability and Demo Readiness
- Capability Slice: CS-14. Error handling and recovery
- Priority: P0
- Sequence Order: 2
- Depends On:
  - M5-01
  - M3-08
- Unlocks:
  - M5-03
  - M5-04
- Decision References:
  - DB-10
  - DB-20
- FR References:
  - FR-11.1
  - FR-11.2
- AC References:
  - AC-13
- Demo References:
  - Step 8
  - Step 9
  - Step 11
  - Step 14
- Risk References:
  - R5
  - R6

## Goal

- Сделать систему устойчивой к invalid YAML, missing linked models и missing notations без аварийного завершения.
- Дать пользователю понятный recovery path для file-based failure modes.

## Why Now

- После стабилизации round-trip можно отдельно довести unhappy paths до приемочного уровня.
- AC-13 и DB-20 требуют явной error policy, а не молчаливых падений.
- Final demo acceptance должен проходить на фоне уже предсказуемых recovery behaviors.

## User/System Outcome

- Пользователь видит понятные сообщения об ошибках и предложения, что делать дальше.
- Система не падает на одном битом файле и изолирует проблемный артефакт.
- Roadmap закрывает обязательный reliability slice перед full demo pass.

## Scope

- Обработать invalid YAML на load path.
- Обработать missing drill-down and step-up targets через понятный prompt/recovery message.
- Обработать missing notation с fallback на open-as-freeform, если это допустимо.
- Локализовать ошибки так, чтобы одна проблема не ломала весь workspace.

## Out of Scope

- Automatic file conflict detection.
- Rich recovery wizard or repair tooling.
- Full concurrency/conflict-resolution platform.

## Preconditions

- M5-01 стабилизировал happy-path round-trip reopen.
- Broken-link semantics и navigation flows уже реализованы.
- DB-20 зафиксировал целевые fallback messages.

## Implementation Notes

- Ошибка должна приводить к понятному сообщению, а не к silent failure.
- Missing notation fallback допустим только в рамках policy docs и не должен терять исходные данные.
- Last-write-wins остается политикой конфликта; не расширяйте scope до merge tooling.
- Recovery behavior должен быть воспроизводим после reopen.

## Files and Artifacts Expected to Change

- Load/open error handling paths.
- User-facing error messages and recovery prompts.
- Validation assets for invalid YAML and missing links.
- Docs or acceptance notes for unhappy paths.

## Acceptance Criteria for This Issue

- Invalid YAML показывает понятное сообщение и не приводит к crash.
- Missing drill-down or step-up target показывает recovery prompt.
- Missing notation дает предупреждение и, где допустимо, позволяет открыть модель как freeform fallback.
- Одна ошибочная сущность не делает весь проект неработоспособным без объяснения.

## Required Tests

### Functional checks

- Открыть проект с deliberately invalid YAML.
- Попробовать открыть missing drill-down / step-up target.
- Открыть модель с отсутствующей notation.

### Smoke checks

- Проверить, что приложение не падает при каждом из unhappy paths.
- Проверить, что после error prompt можно продолжить работу с остальными valid artifacts.

### Regression checks

- Убедиться, что happy-path reopen и navigation не сломаны.
- Проверить, что fallback не повреждает уже сохраненные данные.

### Error handling checks

- Проверить тексты сообщений и наличие понятного next action.
- Проверить локализацию ошибки на один проблемный файл.

## Handoff to Next Issue

### What now works

- File-based unhappy paths обрабатываются без аварийного завершения.
- Пользователь получает понятный путь восстановления.

### What contract is now stable

- Error and fallback policy for invalid YAML, missing links and missing notation.

### What next issue can start

- M5-03 может валидировать persistence and recovery together.
- M5-04 может идти в финальный demo acceptance с контролируемыми failure modes.

## Done Definition

1. AC-13 выполняется полностью.
2. Unhappy paths не приводят к crash.
3. Recovery prompts соответствуют policy docs.
4. Ошибки не расширили scope до conflict platform or repair system.