# M3. Hierarchy and Semantic Navigation

## Goal

Поддержать движение по уровням абстракции: навигационный контекст, drill-down, step-up и multiple drill-down без потери ссылочной целостности.

## User Outcome

Пользователь может создавать дочерние модели для ноды, подниматься из frame на верхний уровень, возвращаться назад через breadcrumbs/back и работать с несколькими детализациями одной ноды.

## Capability Slices Covered

- CS-07. Drill-down creation and navigation
- CS-08. Step-up generation and upper-level navigation
- CS-09. Multiple drill-down support

## Decisions Required Before or Inside Milestone

- DB-16. Navigation model `tree + breadcrumbs + back`
- DB-17. Step-up synchronization semantics
- DB-18. File naming and placement rules
- DB-20. Fallback and error-message policy
- DB-22. Multiple drill-down policy

## Issues in Preferred Sequential Order

1. M3-01 Decide step-up synchronization semantics
2. M3-02 Spike one-shot/manual regeneration approach for cross-model navigation
3. M3-03 Implement breadcrumbs, back stack and model context
4. M3-04 Implement drill-down create, open and return flow
5. M3-05 Implement step-up generation and upper-level navigation
6. M3-06 Add multiple drill-down support
7. M3-07 Validate hierarchy and semantic navigation
8. M3-08 Fix hierarchy and navigation blockers

## Entry Conditions

- M2 exit gate пройден.
- Freeform-модели, nodes, edges и frames устойчиво сохраняются.
- Правила file placement и stable IDs уже зафиксированы.

## Exit Criteria

- Работает single drill-down flow с возвратом.
- Работает step-up flow с верхнеуровневой моделью и обратным переходом.
- Breadcrumbs/back поддерживают основной navigation loop.
- Доменная модель допускает несколько drill-down на одну ноду без архитектурного тупика.

## Key Risks Inside Milestone

- R1. Реализация step-up поверх React Flow и файловой модели.
- R4. Неинтуитивная навигация между уровнями.
- R5. Потеря или повреждение cross-model ссылок при сохранении.

## Minimal Validation

- Ручной проход AC-7 и AC-8.
- Проверка demo steps 6-9.
- Отдельная проверка missing-model fallback для broken links.