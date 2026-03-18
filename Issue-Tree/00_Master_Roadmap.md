# 00. Master Roadmap

## Purpose

Этот Issue Tree переводит пакет `docs/` в последовательный execution plan для MVP VisualExperiments. Основная цель дерева: провести реализацию сверху вниз по единому маршруту от project bootstrap до финального 14-step demo acceptance без скрытых product decisions.

## Milestones In Order

| Milestone | Goal | Main Outcome |
|---|---|---|
| M1. Project Foundation | Зафиксировать bootstrap проекта и workspace shell | Можно создать проект, открыть его и увидеть реальную структуру |
| M2. Freeform Modeling Workspace | Собрать рабочий freeform canvas | Можно создать модель, редактировать ноды, edges и frame |
| M3. Hierarchy and Semantic Navigation | Поддержать движение между уровнями | Работают drill-down, step-up, breadcrumbs, back и multiple drill-down |
| M4. Typing and Notation Workflow | Превратить freeform-модель в reusable language | Работают late typing, notation extraction и typed-model creation |
| M5. Stability and Demo Readiness | Довести MVP до приемочного состояния | Проходят round-trip reopen, error recovery и full 14-step demo |

## Preferred Sequential Path

1. Закрыть M1-01 как planning gate для manifest и file placement.
2. Пройти M1 до validation/bugfix и выйти на устойчивый project workspace.
3. Собрать M2 как базовый freeform editor и закрыть его validation gate.
4. В M3 сначала закрыть DB-17 через decision, затем техпроверку, потом navigation implementations.
5. В M4 пройти путь late typing -> notation -> typed model без уходов в notation editor.
6. В M5 сначала стабилизировать round-trip and recovery, потом запустить финальный 14-step acceptance.
7. Закрыть только critical/high blockers финальной приемки и зафиксировать MVP sign-off.

## MVP Completion Criteria

MVP считается завершенным, когда одновременно выполняются все условия:

- покрыты все обязательные P0 capability slices CS-01..CS-15;
- demo scenario steps 1-14 проходят в одной связной последовательности;
- AC-1..AC-13 локально проверены и не содержат unresolved critical/high blockers;
- project data выдерживает manual save + reopen round-trip без потери структуры;
- invalid YAML, missing model и missing notation не приводят к crash и имеют понятный recovery path.

## Key Dependency Gates

- Gate A: `M1-01` должен быть завершен до `M1-02`, `M2-01`, `M3-04` и `M3-05`.
- Gate B: `M1-05` открывает переход к M2.
- Gate C: `M2-06` открывает переход к M3.
- Gate D: `M3-01` и `M3-02` должны быть завершены до `M3-05`.
- Gate E: `M3-08` открывает переход к M4.
- Gate F: `M4-05` открывает переход к M5.
- Gate G: `M5-03` должен быть завершен до `M5-04`.
- Gate H: `M5-04` формирует blocker list для `M5-05`; после `M5-05` дерево достигает MVP exit.

## Critical Decisions Driving The Roadmap

- DB-11: minimal manifest v1.
- DB-12: model schema v1.
- DB-13: notation schema v1.
- DB-14: stable IDs and relative references.
- DB-16: navigation model `tree + breadcrumbs + back`.
- DB-17: step-up synchronization semantics.
- DB-18: naming and placement rules for created model files.
- DB-19: notation extraction rules.
- DB-20: fallback policy for broken links and invalid YAML.
- DB-21: manual save as mandatory MVP path.
- DB-24: acceptance through manual end-to-end demo scenario.

## What Is Explicitly Not In The Critical Path

- OCS-01 Folder management inside project.
- OCS-02 Model rename and notation reassignment.
- OCS-03 Model-level context panel polish.
- OCS-04 Autosave.
- OCS-05 Edge labels and frame deletion polish beyond what is needed for acceptance.
- All deferred post-MVP topics from DPM-01..DPM-08.