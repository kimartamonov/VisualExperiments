# M4. Typing and Notation Workflow

## Goal

Превратить freeform-диаграмму в повторно используемый язык моделирования: назначение типов, извлечение нотации и создание typed-модели по этой нотации.

## User Outcome

Пользователь может назначить типы объектам в существующей диаграмме, зафиксировать их как YAML-нотацию и затем создать новую модель, в которой типы уже доступны напрямую при создании нод.

## Capability Slices Covered

- CS-10. Late typing in freeform models
- CS-11. Notation extraction from model
- CS-12. Typed model creation from notation

## Decisions Required Before or Inside Milestone

- DB-13. Notation schema v1
- DB-19. Notation extraction rules
- DB-23. Typed-model creation policy
- DB-07. Notation editor is out of MVP

## Issues in Preferred Sequential Order

1. M4-01 Implement late typing in freeform models
2. M4-02 Create and register notation from current model
3. M4-03 Create typed models from notation
4. M4-04 Validate typing and notation workflow
5. M4-05 Fix typing and notation blockers

## Entry Conditions

- M3 exit gate пройден.
- Cross-model navigation работает и не блокирует возврат к исходной диаграмме.
- File placement rules и notation schema v1 признаны достаточными для MVP.

## Exit Criteria

- Пользователь может назначить, изменить и снять тип у ноды.
- Из типизированной модели можно создать notation YAML.
- Можно создать новую typed-модель по существующей нотации.
- Типы и цвета работают как единый сквозной workflow.

## Key Risks Inside Milestone

- R7. Сложность извлечения нотации из модели.
- R5. Потеря связности данных при переходе freeform -> notation -> typed model.

## Minimal Validation

- Ручной проход AC-9, AC-10 и AC-11.
- Проверка demo steps 10-13.
- Базовый reopen after typing and notation creation.