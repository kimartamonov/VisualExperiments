# [M4-01] Implement late typing in freeform models

## Metadata

- Issue ID: M4-01
- Type: Implementation
- Status: Proposed
- Milestone: M4. Typing and Notation Workflow
- Capability Slice: CS-10. Late typing in freeform models
- Priority: P0
- Sequence Order: 1
- Depends On:
  - M3-08
  - M2-02
- Unlocks:
  - M4-02
  - M4-04
- Decision References:
  - DB-13
  - DB-19
  - DB-23
- FR References:
  - FR-8.1
  - FR-8.2
  - FR-8.3
- AC References:
  - AC-9
- Demo References:
  - Step 10
- Risk References:
  - R7
  - R5

## Goal

- Дать пользователю возможность назначать, менять и снимать типы у нод в уже построенной freeform-диаграмме.
- Подготовить данные модели к последующему извлечению reusable notation.

## Why Now

- Late typing является центральной продуктовой гипотезой и входом в notation workflow.
- Без типизации нельзя извлечь meaningful notation из существующей диаграммы.
- Этот issue должен появиться раньше notation extraction, чтобы M4 шел по естественному пользовательскому пути.

## User/System Outcome

- Пользователь может ретроспективно наделять freeform-узлы типами и видеть визуальное различие.
- Система хранит достаточный набор данных, чтобы восстановить назначенные type/color values и затем извлечь их в notation.
- Roadmap получает связку freeform -> typed semantics без перехода к внешнему notation editor.

## Scope

- Реализовать assign type, change type and remove type для ноды.
- Показать визуальное различие типа на canvas через цвет.
- Сохранить назначенные типы и связанные color cues в данных модели в форме, совместимой с дальнейшим notation extraction.
- Гарантировать, что существующие links, positions и frames не ломаются после типизации.

## Out of Scope

- Formal validation of type rules.
- Typed edges.
- Visual notation editor or deep type management UI.

## Preconditions

- M2-02 завершил stable node editing.
- DB-13 и DB-19 дают minimal type/color catalog semantics для MVP.
- Navigation flows M3 не блокируют возврат к исходной модели после semantic operations.

## Implementation Notes

- Используйте минимальный data contract, достаточный для AC-9 и последующего extraction flow; если для v1 потребуется точечное уточнение schema docs, оно должно остаться совместимым с DB-13 и DB-19.
- Не вводите richer meta-rules beyond type/color catalog.
- Снятие типа должно возвращать ноду к freeform-state без разрушения остальных данных.
- Визуальное отличие должно быть достаточно понятным для manual acceptance, даже если styling остается минимальным.

## Files and Artifacts Expected to Change

- Properties panel for node typing.
- Canvas rendering for type/color indication.
- Model persistence contract for assigned type information.
- Manual test assets for typed freeform models.

## Acceptance Criteria for This Issue

- Пользователь может назначить тип любой ноде в freeform-модели.
- Нода визуально меняется после назначения типа.
- Пользователь может изменить тип или снять его.
- Типизация не разрушает existing positions, edges, frames and links.
- Assigned typing survives reopen sufficiently for later notation extraction.

## Required Tests

### Functional checks

- Назначить тип нескольким нодам.
- Изменить тип у одной ноды и снять тип у другой.
- Проверить визуальное отличие на canvas.

### Smoke checks

- Повторить assign/change/remove цикл несколько раз подряд.
- Проверить отсутствие critical UI failures при редактировании typed properties.

### Regression checks

- Убедиться, что node editing, edges, frames и navigation flows не сломаны.
- Проверить, что модель по-прежнему открывается как valid freeform context до создания notation.

### Persistence/reload checks

- Сохранить и переоткрыть модель; типы и color cues должны восстановиться.
- Проверить, что типизация не приводит к потере links или layout.

### UI state checks

- Проверить предсказуемость выделения ноды и редактирования type fields.

## Handoff to Next Issue

### What now works

- Freeform-модель может быть типизирована постфактум.
- В модели есть устойчивые semantic cues для извлечения notation.

### What contract is now stable

- Minimal late-typing contract compatible with notation extraction.
- Type assignment/change/remove behavior.

### What next issue can start

- M4-02 может извлекать notation из уже типизированной модели.
- M4-04 сможет валидировать Step 10 как часть полного workflow.

## Done Definition

1. AC-9 выполняется полностью.
2. Type/color semantics достаточно устойчивы для notation extraction.
3. Persist/reload проверен для assigned typing.
4. Реализация не затягивает formal validation or notation-editor scope.