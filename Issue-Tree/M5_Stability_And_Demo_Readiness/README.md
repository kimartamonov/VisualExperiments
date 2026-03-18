# M5. Stability and Demo Readiness

## Goal

Сделать MVP устойчивым для ручной приемки: reliable manual save, round-trip reopen, понятное восстановление после file-based ошибок и полный проход 14-step demo scenario.

## User Outcome

Пользователь может сохранить проект, снова открыть его без потери структуры, получить понятное сообщение об ошибке при битых данных и пройти полный демонстрационный сценарий без критических блокеров.

## Capability Slices Covered

- CS-13. Save, reload and persistence integrity
- CS-14. Error handling and recovery
- CS-15. Demo hardening and acceptance pass

## Decisions Required Before or Inside Milestone

- DB-03. YAML as source of truth
- DB-15. Persisted vs transient UI state
- DB-20. Fallback and error-message policy
- DB-21. Save strategy
- DB-24. Acceptance policy

## Issues in Preferred Sequential Order

1. M5-01 Implement manual save and round-trip reload integrity
2. M5-02 Implement error handling and recovery fallbacks
3. M5-03 Validate persistence and recovery
4. M5-04 Run full 14-step demo acceptance pass
5. M5-05 Fix critical and high acceptance blockers

## Entry Conditions

- M4 exit gate пройден.
- Все P0 capability slices M1-M4 реализованы и локально приняты.
- YAML файлы и cross-model links уже существуют как рабочие артефакты проекта.

## Exit Criteria

- Проект и все его артефакты проходят round-trip save/reopen без структурной потери.
- Invalid YAML, missing models и missing notations не приводят к crash.
- Сквозной demo scenario из 14 шагов проходит целиком.
- Не остается critical/high defects, блокирующих приемку.

## Key Risks Inside Milestone

- R5. Потеря данных при сбое или reopen.
- R6. Конфликты и проблемы при внешнем редактировании YAML.
- R7. Сложность связки notation + typed model в round-trip.

## Minimal Validation

- Ручной проход AC-12 и AC-13.
- Полный 14-step demo pass.
- Повторный open проекта с моделями, drill-down, step-up и notation artifacts.