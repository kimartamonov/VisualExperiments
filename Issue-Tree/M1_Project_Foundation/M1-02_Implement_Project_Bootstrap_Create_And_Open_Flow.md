# [M1-02] Implement project bootstrap create and open flow

## Metadata

- Issue ID: M1-02
- Type: Implementation
- Status: Proposed
- Milestone: M1. Project Foundation
- Capability Slice: CS-01. Project bootstrap
- Priority: P0
- Sequence Order: 2
- Depends On:
  - M1-01
- Unlocks:
  - M1-03
  - M2-01
- Decision References:
  - DB-11
  - DB-14
  - DB-18
- FR References:
  - FR-1.1
  - FR-1.2
- AC References:
  - AC-1
- Demo References:
  - Step 1
- Risk References:
  - R5

## Goal

- Дать пользователю рабочий create/open project flow с файловым bootstrap на диске.
- Обеспечить предсказуемое создание проекта как реальной папки с минимальным manifest и каталогом моделей.

## Why Now

- Без проектного bootstrap невозможно открыть workspace и перейти к моделированию.
- Этот issue закрывает первый обязательный шаг демо-сценария.
- Все последующие model-level flows зависят от существования корректного project root.

## User/System Outcome

- Пользователь может создать новый проект и открыть существующий из списка.
- Система создает папку проекта, `project.yaml` и `models/` по зафиксированному контракту.
- Roadmap переходит от planning gate к реальной рабочей среде.

## Scope

- Реализовать API и UI для создания проекта.
- Реализовать список проектов и open project action.
- Создавать `project.yaml` с полями v1 и каталог `models/`.
- Читать manifest с диска при открытии проекта.
- Обрабатывать пустой проект без моделей как валидное состояние.

## Out of Scope

- Создание моделей внутри проекта.
- Управление папками внутри проекта.
- Autosave, import/export и внешние интеграции.

## Preconditions

- M1-01 зафиксировал manifest и file placement contract.
- Файловое хранение без БД остается базовой архитектурой.
- В репозитории доступны backend и frontend слои для project flow.

## Implementation Notes

- Используйте `project.yaml` как входную точку проекта, а не как registry runtime-state.
- Не добавляйте в bootstrap дополнительную логику, которая не нужна для Step 1.
- Список проектов может быть простым по UX, если create/open работает устойчиво.
- Отдельно учтите поведение при повторной попытке создать проект с тем же именем или конфликтующим slug.
- Пустой bootstrap должен сериализовать только `id` и `name`; `defaultModel` и `notations` не обязательны.
- Bootstrap создает `models/`, но не обязан создавать `notations/` до первого notation flow.

## Files and Artifacts Expected to Change

- Backend project API and filesystem service.
- Frontend project list / create-open UI.
- YAML serialization for `project.yaml`.
- Smoke-test artifacts for project creation.

## Acceptance Criteria for This Issue

- Создание проекта через UI приводит к появлению проектной папки, `project.yaml` и `models/`.
- Новый проект появляется в списке проектов без ручного refresh workflow.
- Проект открывается и передает управление в рабочее пространство проекта.
- Manifest читается с диска и не требует runtime-only данных для открытия.
- Повторное открытие только что созданного проекта не разрушает структуру.

## Required Tests

### Functional checks

- Создать новый проект через UI и открыть его.
- Открыть уже существующий проект из списка.
- Проверить содержимое созданного `project.yaml`.

### Smoke checks

- Выполнить create/open project минимум два раза подряд без краша.
- Проверить, что пустой проект открывается как валидный workspace context.

### Regression checks

- Убедиться, что создание проекта не ломает список проектов.
- Убедиться, что open flow не зависит от наличия моделей или нотаций.

### Persistence/reload checks

- Закрыть и повторно открыть созданный проект; структура должна сохраниться.
- Проверить, что manifest можно перечитать без потери полей `id` и `name`.

### Error handling checks

- Проверить понятную обработку конфликта имени/пути проекта без аварийного завершения.

## Handoff to Next Issue

### What now works

- Проект можно создать и открыть через UI.
- На диске существует корректный project root с manifest и `models/`.

### What contract is now stable

- Create/open project API.
- Bootstrap структуры проекта на файловой системе.

### What next issue can start

- M1-03 может строить workspace shell и файловое дерево поверх реального project root.
- M2-01 позже сможет безопасно создавать первую модель внутри уже открытого проекта.

## Done Definition

1. AC-1 выполняется полностью.
2. Проект создается и открывается без ручных обходных путей.
3. Данные bootstrap сохраняются на диск и выдерживают reopen.
4. Нет критического дефекта, мешающего перейти к workspace shell.
