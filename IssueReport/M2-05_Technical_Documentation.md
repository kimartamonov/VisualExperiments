# M2-05 Technical Documentation

## Purpose

Этот issue фиксирует validation gate для milestone `M2. Freeform Modeling Workspace` и добавляет воспроизводимый acceptance script для полного freeform workflow.

## Validation Approach

- Validation выполнен как milestone acceptance pass, а не как новая implementation slice.
- Проверка опирается на собранный `dist` runtime и реальные HTTP-запросы к backend/API routes.
- M2 gate теперь покрывает:
  - foundation regression smoke;
  - create/open freeform model;
  - node lifecycle;
  - edge lifecycle;
  - frame lifecycle;
  - reopen after restart;
  - повторный freeform проход на второй модели.

## Validation Harness

### Acceptance script

- `test/freeform-bootstrap-validation.mjs` поднимает server in-process на временном projects root.
- Скрипт выполняет два последовательных freeform model flows внутри одного проекта:
  - primary model: create -> edit -> connect -> frame -> cleanup -> persist;
  - secondary model: repeat freeform flow on a new model to satisfy smoke coverage.
- После restart script повторно открывает проект и обе модели, проверяя сохранность persisted state.

### Regression evidence

- Внутри M2 validation script дополнительно проверяются:
  - landing route `/`;
  - workspace route `/projects/:id`;
  - project list/open API;
  - project tree visibility for created model files.
- Отдельный rerun `npm.cmd run validate:m1` подтверждает, что foundation milestone не деградировал.

## Stable Contracts Confirmed By This Gate

- `project.yaml` продолжает хранить `defaultModel`.
- Freeform model contract стабилен для:
  - `notation`;
  - `nodes`;
  - `edges`;
  - `frames`;
  - frame `nodeIds` membership;
  - frame `stepUp: null`.
- Reopen path сохраняет entity IDs и очищенные references после delete operations.

## Findings Summary

- Critical/high defects в границах `FR-2.1`, `FR-2.3`, `FR-2.6`, `FR-3.x`, `FR-4.x`, `FR-5.x` не обнаружены.
- M2 milestone на текущем уровне реализации считается pass-ready и может переходить в formal bugfix slot без открытого blocker-list.

## Limitations

- Нет browser automation для визуальной проверки drag behavior и canvas layering на уровне DOM interactions.
- Validation подтверждает runtime/persistence contract и связность flow, но не заменяет будущий полный MVP demo pass `M5-04`.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- freeform model create/open flow;
- persisted node editing;
- directed edge lifecycle;
- frame semantic container behavior;
- reopen contract для M2 data model;
- validation evidence, что M2 готов к bugfix closeout in `M2-06`.
