# 02. Dependency Map

## Sequential Dependency Narrative

### Milestone-to-Milestone Chain

`M1 -> M2 -> M3 -> M4 -> M5`

Ни один milestone не стартует по основному пути, пока не закрыт validation/bugfix gate предыдущего milestone.

### Critical Issue Gates

1. `M1-01` фиксирует manifest/path contract.
   После него можно безопасно начинать `M1-02`, а позже `M2-01`, `M3-04` и `M3-05`.

2. `M1-05` закрывает foundation blockers.
   После него можно переходить к `M2-01`.

3. `M2-01 -> M2-02 -> M2-03 -> M2-04` собирают основной freeform flow.
   Только после `M2-04` имеет смысл validation `M2-05`.

4. `M2-06` является gate в hierarchy milestone.
   После него можно брать `M3-01`.

5. `M3-01` закрывает unresolved step-up semantics.
   `M3-05` запрещено стартовать до завершения `M3-01`.

6. `M3-02` подтверждает technical viability выбранной step-up semantics.
   После него `M3-03` и `M3-05` идут без скрытого архитектурного риска.

7. `M3-03` дает общий navigation contract.
   Он обязателен перед `M3-04` и `M3-05`.

8. `M3-04` должен быть завершен до `M3-06`, потому что multiple drill-down является refinement поверх working single drill-down flow.

9. `M3-08` закрывает blockers navigation milestone.
   После него можно переходить к `M4-01`.

10. `M4-01 -> M4-02 -> M4-03` образуют semantic chain:
    сначала late typing, затем notation extraction, затем typed model creation.

11. `M4-05` является gate для `M5-01`.
    Persistence integrity должна опираться на уже стабильные semantics M1-M4.

12. `M5-01` обязателен перед `M5-02`, `M5-03` и `M5-04`.
    Нельзя валидировать recovery and final demo без надежного round-trip.

13. `M5-03` валидирует persistence/recovery baseline.
    Только после этого запускается `M5-04` full acceptance.

14. `M5-05` исправляет only critical/high blockers из `M5-03` и `M5-04`.
    После него roadmap доходит до MVP exit.

## Blocking Issues

- M1-01 blocks all create-model and cross-model file operations.
- M3-01 blocks step-up implementation.
- M3-02 blocks confident step-up execution under risk R1.
- M5-01 blocks final acceptance because round-trip integrity is mandatory.
- M5-04 blocks final sign-off because acceptance is defined by full demo scenario.

## When The Next Big Block Can Start

- M2 can start after `M1-05`.
- M3 can start after `M2-06`.
- M4 can start after `M3-08`.
- M5 can start after `M4-05`.
- MVP sign-off can start after `M5-05` and rerun of affected acceptance steps.