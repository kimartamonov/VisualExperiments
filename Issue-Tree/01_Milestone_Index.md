# 01. Milestone Index

## Milestone Overview

| ID | Name | Goal | Capability Slices | Issues In Order | Exit Criteria |
|---|---|---|---|---|---|
| M1 | Project Foundation | Создать проектный bootstrap и рабочее пространство | CS-01, CS-02 | M1-01, M1-02, M1-03, M1-04, M1-05 | Создание/открытие проекта устойчиво; file tree и shell готовы |
| M2 | Freeform Modeling Workspace | Дать полноценный freeform canvas | CS-03, CS-04, CS-05, CS-06 | M2-01, M2-02, M2-03, M2-04, M2-05, M2-06 | Работают model create/open, nodes, edges, frames и reopen |
| M3 | Hierarchy and Semantic Navigation | Поддержать переходы между уровнями | CS-07, CS-08, CS-09 | M3-01, M3-02, M3-03, M3-04, M3-05, M3-06, M3-07, M3-08 | Работают drill-down, step-up, breadcrumbs/back и multi-drilldown |
| M4 | Typing and Notation Workflow | Превратить freeform в reusable language | CS-10, CS-11, CS-12 | M4-01, M4-02, M4-03, M4-04, M4-05 | Работают late typing, notation extraction и typed-model creation |
| M5 | Stability and Demo Readiness | Довести MVP до приемочного состояния | CS-13, CS-14, CS-15 | M5-01, M5-02, M5-03, M5-04, M5-05 | Проходит reopen, recovery и финальный 14-step demo pass |

## Entry/Exit Notes By Milestone

### M1

- Entry: зафиксированные docs, accepted baseline decisions DB-01..DB-10.
- Exit: AC-1 and AC-2 закрыты; workspace shell готов к model lifecycle.

### M2

- Entry: M1 foundation принят локально.
- Exit: AC-3..AC-6 закрыты; freeform editor выдерживает reopen.

### M3

- Entry: M2 freeform workflow стабилен.
- Exit: AC-7 and AC-8 закрыты; hierarchy navigation обратима и не скрывает unresolved step-up semantics.

### M4

- Entry: M3 navigation стабильна.
- Exit: AC-9..AC-11 закрыты; notation становится рабочим артефактом.

### M5

- Entry: M1-M4 P0 capability slices локально приняты.
- Exit: AC-12 and AC-13 закрыты; full 14-step demo passes without unresolved critical/high blockers.