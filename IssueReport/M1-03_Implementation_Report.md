# M1-03 Implementation Report

## Implemented Issue

- Issue ID: `M1-03`
- Title: `Implement workspace shell and project tree`
- Completed on: `2026-03-18`

## What Was Done

- Расширен backend project service чтением реального файлового дерева проекта.
- Добавлен REST endpoint `GET /api/projects/:projectId/tree`.
- Переведен frontend open-project экран в устойчивый three-panel workspace shell.
- Левая панель теперь показывает реальные папки и YAML-файлы проекта из backend tree API.
- Добавлен refresh tree flow, чтобы shell мог обновить структуру после появления новых файлов без смены архитектуры.
- Центр и правая панель оформлены как стабильные placeholders для canvas и properties, без захода в model editing раньше времени.
- Добавлен service-level test на отражение новых model files в дереве проекта.

## Files Changed

- `src/server/project-service.ts`
- `src/server/index.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `IssueReleaseJournal.md`

## Acceptance Criteria Covered

- После открытия проекта пользователь видит трехпанельный layout.
- Левая панель отображает реальные папки и YAML-файлы проекта.
- При появлении нового model file дерево может быть обновлено и показать его без смены архитектуры shell.
- Центральная и правая панели готовы к размещению canvas и properties.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- Короткий boot-check сервера через `node dist/server/index.js` с подтверждением старта.

## Out of Scope

- Логическое дерево поверх файлового.
- Breadcrumbs/back stack и semantic navigation.
- Полноценное открытие модели на canvas.
- Создание моделей из tree UI.

## Remaining Risks

- `M1-04` еще должен валидировать shell end-to-end на нескольких проектах и сценариях.
- Навигация через tree пока ограничена selection-aware placeholder, а не реальным model open flow.
- Browser-level E2E тестов пока нет; верификация закрыта service/build/runtime checks.

## What Is Now Unblocked

- `M1-04` может валидировать foundation milestone как сквозной проектный bootstrap + shell flow.
- `M2-01` может добавлять create/open freeform model в уже существующий workspace shell и file tree.
- `M3-03` позже сможет опираться на готовый layout для navigation context.

