# M2-01 Implementation Report

## Implemented Issue

- Issue ID: `M2-01`
- Title: `Create freeform model and open empty canvas`
- Completed on: `2026-03-18`

## What Was Done

- Реализован backend create/open flow для freeform-моделей.
- Добавлено создание YAML-модели с `notation: freeform` и явными пустыми коллекциями `nodes`, `edges`, `frames`.
- Реализовано обновление `project.yaml.defaultModel` при создании первой модели проекта.
- Реализовано открытие модели по path и повторное чтение модели после reopen.
- Расширен frontend workspace shell формой создания модели и открытием model YAML из дерева проекта.
- Центр shell теперь показывает empty canvas bootstrap для открытой freeform-модели.
- Обновлен tree refresh flow, чтобы новая модель сразу появлялась в файловом дереве.
- Добавлены service-level и HTTP-level validation checks для model lifecycle.

## Files Changed

- `src/server/project-service.ts`
- `src/server/app.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `test/freeform-bootstrap-validation.mjs`
- `package.json`
- `IssueReleaseJournal.md`

## Acceptance Criteria Covered

- Пользователь может создать freeform-модель без выбора нотации.
- После создания открывается пустой canvas.
- В дереве проекта появляется YAML-файл модели.
- В файле модели сохранено `notation: freeform` и явные пустые коллекции.
- После reopen модель открывается без потери структуры.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- `npm.cmd run validate:m2`

## Out of Scope

- Typed model creation.
- Node editing, edge editing и frame editing.
- Rename model и notation reassignment.
- Любая semantic navigation beyond project tree open flow.

## Remaining Risks

- Empty canvas пока не содержит graph editing behavior; это scope `M2-02+`.
- UI-level browser automation пока отсутствует; lifecycle подтвержден service и HTTP validation checks.
- Дальнейшие model operations еще должны доказать, что current shell не требует layout redesign.

## What Is Now Unblocked

- `M2-02` может добавлять node editing в уже существующую freeform-модель.
- `M3-04` и `M3-05` позже смогут использовать тот же model path/open contract.

