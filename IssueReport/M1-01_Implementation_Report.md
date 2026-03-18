# M1-01 Implementation Report

## Implemented Issue

- Issue ID: `M1-01`
- Title: `Finalize project manifest and file placement contract`
- Completed on: `2026-03-18`

## What Was Done

- Зафиксирован manifest v1 как минимальный контракт: обязательны только `id` и `name`, опциональны `defaultModel` и `notations`.
- Уточнено поведение bootstrap проекта: создаются только корень проекта, `project.yaml` и `models/`; `notations/` создается по требованию.
- Зафиксированы правила размещения для `create model`, `drill-down` и `step-up`.
- Зафиксированы правила slug-именования, conflict suffix и хранения путей относительно корня проекта.
- Обновлены зависимые issue-артефакты, чтобы `M1-02`, `M2-01`, `M3-04` и `M3-05` могли стартовать без дополнительных planning-решений.

## Files Changed

- `docs/05-planning/13_Decision_Backlog.md`
- `docs/03-solution/09_Data_and_Integrations.md`
- `docs/02-requirements/07_Domain_Model.md`
- `docs/04-delivery/10_Roadmap_and_Delivery_Plan.md`
- `docs/04-delivery/12_Risks_Decisions_Open_Questions.md`
- `Issue-Tree/M1_Project_Foundation/M1-02_Implement_Project_Bootstrap_Create_And_Open_Flow.md`
- `Issue-Tree/M2_Freeform_Modeling_Workspace/M2-01_Create_Freeform_Model_And_Open_Empty_Canvas.md`
- `Issue-Tree/M3_Hierarchy_and_Semantic_Navigation/M3-04_Implement_DrillDown_Create_Open_And_Return.md`
- `Issue-Tree/M3_Hierarchy_and_Semantic_Navigation/M3-05_Implement_StepUp_Generation_And_UpperLevel_Navigation.md`
- `IssueReleaseJournal.md`

## Acceptance Criteria Covered

- Минимальный manifest v1 зафиксирован письменно без новых обязательных полей сверх docs.
- Правила размещения файлов для create model, drill-down и step-up зафиксированы письменно.
- Relative paths, slug names и stable ids описаны без двусмысленности.
- Следующий implementation issue (`M1-02`) может стартовать без скрытого решения о path semantics.

## Checks Performed

- Сверены `IssueReleaseJournal.md`, milestone README и зависимые issues по handoff-контракту.
- Проверено отсутствие противоречий с `07_Domain_Model.md` и `09_Data_and_Integrations.md`.
- Проверено, что решение не затягивает в MVP rename/move, migration и logical-tree scope.
- Проверен журнал выполнения: `M1-01` переведен в `Done`, `M1-02` назначен `Current`.

## Out of Scope

- Реализация create/open project flow.
- Реализация create model, drill-down и step-up в коде.
- Закрытие DB-12, DB-13 и DB-17.

## Remaining Risks

- Точная схема `model.yaml` и `notation.yaml` все еще остается provisional до следующих issues.
- Семантика step-up synchronization (`DB-17`) по-прежнему остается отдельным решением Milestone 3.
- Реальный bootstrap/UI flow еще не проверен кодом, потому что текущий issue закрывал planning gate.

## What Is Now Unblocked

- `M1-02` может реализовывать create/open project flow с фиксированным manifest contract.
- `M2-01` получает определенное правило для первой freeform-модели и `defaultModel`.
- `M3-04` и `M3-05` получают предсказуемые path rules для child и upper-level моделей.
