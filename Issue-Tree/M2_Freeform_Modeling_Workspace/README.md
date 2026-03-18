# M2. Freeform Modeling Workspace

## Goal

Дать пользователю полноценный freeform canvas: создание и открытие модели, базовое редактирование диаграммы, directed edges и frame как семантический контейнер.

## User Outcome

Пользователь может создать freeform-модель, открыть пустой canvas, нарисовать диаграмму из нод и стрелок, объединить часть нод во frame и сохранить все это как реальную модель проекта.

## Capability Slices Covered

- CS-03. Model lifecycle and freeform bootstrap
- CS-04. Node editing
- CS-05. Edge editing
- CS-06. Frame as semantic container

## Decisions Required Before or Inside Milestone

- DB-12. Model schema v1
- DB-15. Persisted state vs transient UI state
- DB-18. File naming and placement rules
- DB-09. Typed edges and formal validation are out of MVP

## Issues in Preferred Sequential Order

1. M2-01 Create freeform model and open empty canvas
2. M2-02 Create and persist nodes in freeform models
3. M2-03 Create and delete directed edges
4. M2-04 Create and persist frames as semantic containers
5. M2-05 Validate freeform modeling workspace
6. M2-06 Fix freeform workflow blockers

## Entry Conditions

- M1 exit gate пройден.
- Правила размещения файлов и manifest contract зафиксированы.
- Workspace shell умеет показывать tree и содержать canvas/properties panels.

## Exit Criteria

- Можно создать freeform-модель и открыть ее на пустом canvas.
- Можно создавать, двигать, редактировать и удалять ноды.
- Можно создавать и удалять directed edges.
- Можно создавать frame, задавать ему имя и состав нод.
- Все базовые сущности устойчивы к сохранению и reopen.

## Key Risks Inside Milestone

- R5. Потеря данных при записи модели.
- R3. Сохранение model state не должно создавать UI-friction при базовых операциях.

## Minimal Validation

- Ручной проход AC-3, AC-4, AC-5 и AC-6.
- Проверка demo steps 3-5.
- Reopen модели без потери nodes, edges и frames.