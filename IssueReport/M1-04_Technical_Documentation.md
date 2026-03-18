# M1-04 Technical Documentation

## Purpose

Этот issue фиксирует validation gate для milestone M1 и добавляет воспроизводимый acceptance script для foundation flow.

## Validation Approach

- Validation выполнена как acceptance pass, а не exploratory implementation.
- Основной сценарий проверки:
  - health and SPA entry;
  - create project;
  - list/open project;
  - read project tree;
  - refresh tree after new model file appears;
  - reopen after server restart.
- Проверка опирается на собранный `dist` runtime, чтобы не валидировать только исходники в отрыве от сборки.

## Technical Changes Supporting Validation

### Reusable server factory

- `src/server/app.ts` выделяет `createApp()` для повторного использования runtime и validation harness.
- `src/server/index.ts` теперь отвечает только за production-style startup.

### Validation harness

- `test/foundation-validation.mjs` поднимает server in-process на временном порту.
- Validation использует временный projects root и реальные HTTP-запросы к REST API и SPA routes.
- Проверка tree refresh моделирует появление нового YAML-файла на диске и подтверждает, что следующий tree read его видит.

## Findings Summary

- Critical/high defects в границах `FR-1.1`, `FR-1.2`, `FR-1.3`, `FR-10.1` не обнаружены.
- Foundation milestone на текущем уровне реализации считается pass-ready.

## Limitations

- Нет browser automation, которая визуально подтверждает render panels пиксель-в-пиксель.
- Validation проверяет HTTP/runtime contracts и их связь с shell behavior, но не включает canvas/model features из следующих milestones.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- project bootstrap flow;
- project open flow;
- workspace shell entry;
- backend file-tree contract;
- foundation validation evidence for M1 milestone.

