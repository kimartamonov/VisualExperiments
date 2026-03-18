# [M2-05] Validate freeform modeling workspace

## Metadata

- Issue ID: M2-05
- Type: Validation
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-04. Node editing
- Priority: P0
- Sequence Order: 5
- Depends On:
  - M2-01
  - M2-02
  - M2-03
  - M2-04
- Unlocks:
  - M2-06
  - M3-01
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

- Подтвердить, что M2 дает цельный freeform workflow, пригодный для старта hierarchical features.
- Зафиксировать blockers до того, как M3 начнет создавать cross-model links.

## Why Now

- Drill-down и step-up нельзя строить на частично рабочем редакторе диаграмм.
- Milestone обязан завершаться интеграционным validation issue, а не набором локальных проверок.
- Этот issue формально закрывает exit criteria M2.

## User/System Outcome

- Пользователь может пройти freeform flow от создания модели до диаграммы со frame.
- Система подтверждает, что nodes, edges и frames совместимы друг с другом и выдерживают reopen.
- Roadmap получает clear gate на переход к hierarchy/navigation.

## Scope

- Пройти AC-3, AC-4, AC-5 и AC-6 по ручному чек-листу.
- Проверить demo steps 3-5 end-to-end.
- Проверить reopen модели с nodes, edges и frames.
- Зафиксировать pass/fail и список blockers.

## Out of Scope

- Исправление найденных defects внутри validation issue.
- Drill-down, step-up или typing behavior.
- P1-polish поверх freeform editing.

## Preconditions

- Все implementation issues M2 завершены.
- Доступен тестовый проект для ручной проверки freeform flow.
- Save/open path для model files уже реализован.

## Implementation Notes

- Оценивайте milestone как единый поток, а не как отдельные локальные widgets.
- Findings должны быть привязаны к AC или demo step, который они блокируют.
- Не превращайте validation в поиск новых функций для M2.

## Files and Artifacts Expected to Change

- Validation checklist and acceptance log.
- Demo evidence for steps 3-5.
- Bug list for M2-06.

## Acceptance Criteria for This Issue

- AC-3, AC-4, AC-5 и AC-6 вручную проверены и задокументированы.
- Demo steps 3-5 проходятся одной связной последовательностью.
- Reopen модели подтверждает сохранность nodes, edges и frames.
- Все critical/high defects зафиксированы как явные blockers для M2 exit.

## Required Tests

### Functional checks

- Создать freeform-модель, добавить ноды, edges и frame.
- Изменить свойства и проверить финальное состояние диаграммы.

### Smoke checks

- Повторить freeform flow на новой модели минимум дважды.
- Проверить отсутствие аварийного завершения при базовом сценарии.

### Regression checks

- Убедиться, что M1 foundation flow не сломан.
- Убедиться, что create/open model по-прежнему стабилен после graph editing.

### Persistence/reload checks

- Сохранить и заново открыть модель с полным набором сущностей.
- Проверить целостность IDs и membership после round-trip.

## Handoff to Next Issue

### What now works

- Freeform editor workflow проверен на интеграционном уровне.
- Известные blockers, если есть, явно зафиксированы.

### What contract is now stable

- M2 data contract для model/nodes/edges/frames.
- Базовый freeform editing path принят локально.

### What next issue can start

- M2-06 может закрыть blockers.
- M3-01 может стартовать, когда M2 exit считается закрытым.

## Done Definition

1. Validation result оформлен с pass/fail и findings.
2. Demo steps 3-5 проверены вручную.
3. Нет незафиксированных blocker-level дефектов.
4. Переход к M3 либо разрешен, либо остановлен с понятным списком причин.