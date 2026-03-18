# 03. Traceability Matrix

Матрица связывает каждый issue с capability slice, требованиями, acceptance criteria, demo steps, backlog decisions и ключевыми рисками.

## M1. Project Foundation

| Issue | Type | Slice | FR | AC | Demo | Decisions | Risks |
|---|---|---|---|---|---|---|---|
| M1-01 | Decision | CS-01 | FR-1.1, FR-1.2, FR-2.1 | AC-1, AC-3 | Step 1, 3 | DB-11, DB-14, DB-18 | R5 |
| M1-02 | Implementation | CS-01 | FR-1.1, FR-1.2 | AC-1 | Step 1 | DB-11, DB-14, DB-18 | R5 |
| M1-03 | Implementation | CS-02 | FR-1.3, FR-10.1 | AC-2 | Step 2 | DB-05, DB-16 | R4 |
| M1-04 | Validation | CS-01 | FR-1.1, FR-1.2, FR-1.3, FR-10.1 | AC-1, AC-2 | Step 1, 2 | DB-24 | R5 |
| M1-05 | Bugfix | CS-02 | FR-1.1, FR-1.2, FR-1.3, FR-10.1 | AC-1, AC-2 | Step 1, 2 | DB-24 | R5 |

## M2. Freeform Modeling Workspace

| Issue | Type | Slice | FR | AC | Demo | Decisions | Risks |
|---|---|---|---|---|---|---|---|
| M2-01 | Implementation | CS-03 | FR-2.1, FR-2.3, FR-2.6 | AC-3 | Step 3 | DB-12, DB-15, DB-18 | R5 |
| M2-02 | Implementation | CS-04 | FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5 | AC-4 | Step 4 | DB-12, DB-15 | R5 |
| M2-03 | Implementation | CS-05 | FR-4.1, FR-4.3 | AC-5 | Step 4 | DB-09, DB-12 | R5 |
| M2-04 | Implementation | CS-06 | FR-5.1, FR-5.2, FR-5.3, FR-5.4 | AC-6 | Step 5, 6 | DB-12 | R5 |
| M2-05 | Validation | CS-04 | FR-2.1, FR-2.3, FR-2.6, FR-3.x, FR-4.x, FR-5.x | AC-3, AC-4, AC-5, AC-6 | Step 3, 4, 5 | DB-24 | R5 |
| M2-06 | Bugfix | CS-06 | FR-2.1, FR-2.3, FR-2.6, FR-3.x, FR-4.x, FR-5.x | AC-3, AC-4, AC-5, AC-6 | Step 3, 4, 5 | DB-24 | R5 |

## M3. Hierarchy and Semantic Navigation

| Issue | Type | Slice | FR | AC | Demo | Decisions | Risks |
|---|---|---|---|---|---|---|---|
| M3-01 | Decision | CS-08 | FR-7.1, FR-7.2, FR-7.3, FR-10.2, FR-10.3 | AC-8 | Step 6, 7 | DB-17 | R1, R4 |
| M3-02 | Spike | CS-08 | FR-7.1, FR-7.2, FR-7.3, FR-10.2, FR-10.3 | AC-8 | Step 6, 7 | DB-14, DB-16, DB-17, DB-18 | R1, R4, R5 |
| M3-03 | Implementation | CS-07 | FR-10.2, FR-10.3 | AC-7, AC-8 | Step 7, 9 | DB-16, DB-20 | R4 |
| M3-04 | Implementation | CS-07 | FR-6.1, FR-6.2, FR-6.3, FR-10.2, FR-10.3 | AC-7 | Step 8, 9 | DB-06, DB-16, DB-18, DB-20, DB-22 | R4, R5 |
| M3-05 | Implementation | CS-08 | FR-7.1, FR-7.2, FR-7.3, FR-10.2, FR-10.3 | AC-8 | Step 6, 7 | DB-16, DB-17, DB-18 | R1, R4, R5 |
| M3-06 | Refinement | CS-09 | FR-6.4, FR-6.5 | AC-7 | Step 8, 9 | DB-22, DB-20 | R4, R5 |
| M3-07 | Validation | CS-07 | FR-6.x, FR-7.x, FR-10.2, FR-10.3 | AC-7, AC-8 | Step 6, 7, 8, 9 | DB-24 | R1, R4, R5 |
| M3-08 | Bugfix | CS-08 | FR-6.x, FR-7.x, FR-10.2, FR-10.3 | AC-7, AC-8 | Step 6, 7, 8, 9 | DB-24 | R1, R4, R5 |

## M4. Typing and Notation Workflow

| Issue | Type | Slice | FR | AC | Demo | Decisions | Risks |
|---|---|---|---|---|---|---|---|
| M4-01 | Implementation | CS-10 | FR-8.1, FR-8.2, FR-8.3 | AC-9 | Step 10 | DB-13, DB-19, DB-23 | R7, R5 |
| M4-02 | Implementation | CS-11 | FR-9.1 | AC-10 | Step 11 | DB-11, DB-13, DB-19 | R7, R5 |
| M4-03 | Implementation | CS-12 | FR-2.2, FR-9.2 | AC-11 | Step 12, 13 | DB-13, DB-23, DB-18 | R7, R5 |
| M4-04 | Validation | CS-10 | FR-8.x, FR-2.2, FR-9.1, FR-9.2 | AC-9, AC-10, AC-11 | Step 10, 11, 12, 13 | DB-24 | R7, R5 |
| M4-05 | Bugfix | CS-12 | FR-8.x, FR-2.2, FR-9.1, FR-9.2 | AC-9, AC-10, AC-11 | Step 10, 11, 12, 13 | DB-24 | R7, R5 |

## M5. Stability and Demo Readiness

| Issue | Type | Slice | FR | AC | Demo | Decisions | Risks |
|---|---|---|---|---|---|---|---|
| M5-01 | Implementation | CS-13 | FR-2.6, FR-11.1, FR-11.2 | AC-12 | Step 14 | DB-03, DB-15, DB-21 | R5, R6, R7 |
| M5-02 | Implementation | CS-14 | FR-11.1, FR-11.2 | AC-13 | Step 8, 9, 11, 14 | DB-10, DB-20 | R5, R6 |
| M5-03 | Validation | CS-13 | FR-2.6, FR-11.1, FR-11.2 | AC-12, AC-13 | Step 14 | DB-24 | R5, R6, R7 |
| M5-04 | Validation | CS-15 | All P0 FR | AC-1..AC-13 | Step 1..Step 14 | DB-24 | R1, R4, R5, R7 |
| M5-05 | Bugfix | CS-15 | All P0 FR | AC-1..AC-13 | Step 1..Step 14 | DB-24 | R1, R4, R5, R6, R7 |

## Coverage Check

- All P0 slices CS-01..CS-15 are covered.
- Every milestone ends with at least one validation issue.
- Save/reload integrity is present both locally inside issue tests and explicitly in CS-13.
- Full demo path is covered from M1-02 through M5-04/M5-05.