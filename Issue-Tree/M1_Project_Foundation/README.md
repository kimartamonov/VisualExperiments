# M1. Project Foundation

## Goal

Собрать минимальный, но устойчивый фундамент проекта: файловый bootstrap, manifest v1, правила размещения новых файлов и рабочее пространство с реальным деревом проекта.

## User Outcome

Пользователь может создать проект, открыть его и сразу попасть в трехпанельное рабочее пространство, в котором слева видна фактическая файловая структура проекта.

## Capability Slices Covered

- CS-01. Project bootstrap
- CS-02. Project tree and workspace shell

## Decisions Required Before or Inside Milestone

- DB-11. Manifest schema v1
- DB-18. File naming and placement rules
- DB-14. Stable IDs and references
- DB-05. Real project file structure as part of UX

## Issues in Preferred Sequential Order

1. M1-01 Finalize project manifest and file placement contract
2. M1-02 Implement project bootstrap create/open flow
3. M1-03 Implement workspace shell and project tree
4. M1-04 Validate project foundation milestone
5. M1-05 Fix project foundation blockers

## Entry Conditions

- Документы `docs/` признаны source of truth.
- Приняты базовые архитектурные решения DB-01..DB-10.
- Не требуется поддержка P1-операций вроде project folders inside project или autosave.

## Exit Criteria

- Создание проекта стабильно создает папку проекта, `project.yaml` и `models/`.
- Проект можно открыть и увидеть файловую структуру в левой панели.
- Workspace shell готов принять операции создания и открытия моделей без переделки layout.

## Key Risks Inside Milestone

- R5. Потеря данных или некорректный bootstrap проекта.
- R4. Слишком размытая навигация с самого начала затруднит дальнейшие cross-model flows.

## Minimal Validation

- Ручной проход AC-1 и AC-2.
- Проверка demo steps 1-2.
- Повторное открытие только что созданного проекта без потери структуры.