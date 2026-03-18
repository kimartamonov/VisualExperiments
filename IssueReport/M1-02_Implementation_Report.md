# M1-02 Implementation Report

## Implemented Issue

- Issue ID: `M1-02`
- Title: `Implement project bootstrap create and open flow`
- Completed on: `2026-03-18`

## What Was Done

- Собран минимальный runtime foundation приложения на `Node.js + TypeScript + React`.
- Реализован backend API для списка проектов, создания проекта и открытия проекта через manifest.
- Реализован файловый bootstrap проекта на диске: создаются папка проекта, `project.yaml` и каталог `models/`.
- Реализован frontend project browser с create/open flow без ручного refresh.
- Добавлен базовый workspace context после открытия проекта, достаточный для передачи управления следующему issue.
- Добавлены smoke/service tests для bootstrap, reopen и conflict handling.

## Files Changed

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.gitignore`
- `scripts/build.mjs`
- `public/index.html`
- `src/server/errors.ts`
- `src/server/project-service.ts`
- `src/server/index.ts`
- `src/client/api.ts`
- `src/client/App.tsx`
- `src/client/main.tsx`
- `src/client/styles.css`
- `test/project-service.test.mjs`
- `IssueReleaseJournal.md`

## Acceptance Criteria Covered

- Создание проекта через UI приводит к появлению проектной папки, `project.yaml` и `models/`.
- Новый проект появляется в списке проектов без ручного refresh workflow.
- Проект открывается и передает управление в рабочее пространство проекта.
- Manifest читается с диска и не требует runtime-only данных для открытия.
- Повторное открытие только что созданного проекта не разрушает структуру.

## Checks Performed

- `npm.cmd run check`
- `npm.cmd run build`
- `npm.cmd test`
- Короткий boot-check сервера через `node dist/server/index.js` с подтверждением старта.

## Out of Scope

- Реальное файловое дерево проекта в левой панели.
- Трехпанельный workspace shell.
- Create model flow и работа с моделями.
- Breadcrumbs/back/navigation context сверх базового open project state.

## Remaining Risks

- `M1-03` еще должен довести open project до полного трехпанельного shell и file tree.
- Пока не покрыт UI-level end-to-end тест, проверка frontend выполнена через сборку и интеграцию с backend, а не через browser automation.
- Текущий storage root фиксирован на `runtime/projects` по умолчанию и еще не имеет UX-настроек.

## What Is Now Unblocked

- `M1-03` может строить реальный workspace shell и tree API поверх уже работающего create/open flow.
- `M2-01` позже сможет создавать первую freeform-модель внутри уже открытого проекта.

