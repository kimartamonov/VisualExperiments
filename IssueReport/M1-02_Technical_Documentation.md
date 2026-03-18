# M1-02 Technical Documentation

## Purpose

Этот issue реализует первый рабочий vertical slice приложения: пользователь может создать проект, увидеть его в списке и открыть проектный context, опираясь на manifest на диске.

## Architectural Approach

- Backend реализован как `Express`-сервер с REST API и раздачей собранного frontend.
- Frontend реализован на `React` и работает как SPA без тяжелого routing-layer: для `M1-02` достаточно project list и open project route.
- Persistence остается файловой: каждый проект хранится как реальная папка в `runtime/projects` по умолчанию.
- Manifest читается и сериализуется как YAML без runtime-only полей.

## Contracts And Data Structures

### REST API

- `GET /api/projects`
  - возвращает список проектов из manifest-файлов.
- `POST /api/projects`
  - принимает `{ name }`;
  - создает project folder, `project.yaml`, `models/`;
  - возвращает данные открытого проекта.
- `GET /api/projects/:projectId`
  - читает manifest с диска и возвращает workspace bootstrap context.

### `project.yaml`

- Required fields: `id`, `name`
- Optional fields stay absent in empty bootstrap project: `defaultModel`, `notations`

### Frontend state

- `projects`: список проектов для browser layer.
- `activeProjectId`: текущий проект из URL.
- `currentProject`: открытый workspace context, перечитанный с backend.
- `error/loading/submitting`: transient UI state, не попадающий в persistence.

## Key Logic

- Имя проекта нормализуется в slug папки; конфликт slug обрабатывается как readable `409 Conflict`.
- Manifest создается только с полями `id` и `name`, что соответствует `M1-01`.
- `models/` создается при bootstrap всегда; `notations/` не создается заранее.
- Открытие проекта идет по `projectId`, но источник истины остается manifest на диске, а не runtime cache.
- SPA-route `/projects/:id` позволяет повторно открывать проектный context без ручного шага выбора.

## Limitations

- Workspace пока не является полным трехпанельным shell.
- File tree API еще не реализован.
- Нет model create/open behavior.
- Нет browser automation tests; текущая верификация закрывает service/build/runtime startup.

## Integration Points

- `M1-03` добавит file-tree endpoint и устойчивый трехпанельный layout поверх текущего open flow.
- `M2-01` использует текущий project context и filesystem bootstrap для create freeform model.
- `M5` позднее сможет включить project bootstrap в round-trip acceptance path.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- create/open project REST API;
- bootstrap проекта на диске;
- manifest read path;
- project browser flow на frontend;
- workspace context entry point после открытия проекта.

