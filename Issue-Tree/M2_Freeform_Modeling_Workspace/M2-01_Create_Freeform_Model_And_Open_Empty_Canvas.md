# [M2-01] Create freeform model and open empty canvas

## Metadata

- Issue ID: M2-01
- Type: Implementation
- Status: Proposed
- Milestone: M2. Freeform Modeling Workspace
- Capability Slice: CS-03. Model lifecycle and freeform bootstrap
- Priority: P0
- Sequence Order: 1
- Depends On:
  - M1-05
- Unlocks:
  - M2-02
  - M3-04
  - M3-05
- Decision References:
  - DB-12
  - DB-15
  - DB-18
- FR References:
  - FR-2.1
  - FR-2.3
  - FR-2.6
- AC References:
  - AC-3
- Demo References:
  - Step 3
- Risk References:
  - R5

## Goal

- Дать пользователю возможность создать новую freeform-модель и сразу открыть ее в рабочем canvas.
- Стабилизировать модельный lifecycle v1: create -> persist -> open.

## Why Now

- Без модели canvas не получает предметных данных и все editor issues становятся искусственными.
- Этот issue закрывает точку входа для всех M2/M3 flows, которые ссылаются на модельные файлы.
- Он также закрепляет reuse rules для create model path, которые понадобятся drill-down и step-up.

## User/System Outcome

- Пользователь создает модель без выбора нотации и видит пустой canvas.
- Система создает YAML-файл модели с `notation: freeform` и пустыми коллекциями `nodes`, `edges`, `frames`.
- Roadmap получает первый настоящий editor artifact внутри проекта.

## Scope

- Реализовать create freeform model flow в текущем проекте.
- Создавать модельный YAML-файл по schema v1.
- Открывать созданную модель в центральной области как пустой canvas.
- Отражать новую модель в file tree.
- Поддержать повторное открытие созданной модели.

## Out of Scope

- Typed model creation.
- Rename model и notation reassignment.
- Editing nodes, edges or frames.

## Preconditions

- M1 foundation flow закрыт и workspace shell стабилен.
- File placement rule для новых моделей зафиксирован в M1-01.
- Model schema v1 принят как база для YAML persistence.

## Implementation Notes

- Поле `notation` должно быть `freeform`, а не пустым значением.
- Пустые коллекции `nodes`, `edges` и `frames` сериализуются явно.
- Не смешивайте create model и editing graph contents в одном issue.
- Сразу привязывайте open flow к path/id модели, а не к временному UI-состоянию.
- Если пользователь не выбрал каталог, модель создается в `models/`; первая модель пустого проекта по умолчанию должна стать `models/main.yaml`.
- Если `project.yaml` еще не содержит `defaultModel`, первая успешно созданная стартовая модель должна заполнить это поле.

## Files and Artifacts Expected to Change

- Backend model creation/open API.
- YAML serialization for model files.
- Frontend create-model action and canvas bootstrap.
- Project tree refresh behavior.

## Acceptance Criteria for This Issue

- Пользователь может создать freeform-модель без выбора нотации.
- После создания открывается пустой canvas.
- В дереве проекта появляется YAML-файл модели.
- В файле модели сохранено `notation: freeform` и явные пустые коллекции.
- После reopen модель открывается без потери структуры.

## Required Tests

### Functional checks

- Создать freeform-модель из рабочего пространства проекта.
- Открыть только что созданную модель повторно из дерева проекта.
- Проверить содержимое YAML-файла модели.

### Smoke checks

- Создать несколько freeform-моделей подряд без краша.
- Переключаться между пустыми моделями в одном проекте.

### Regression checks

- Убедиться, что M1 foundation flow не сломан create model behavior.
- Убедиться, что file tree обновляется корректно после создания модели.

### Persistence/reload checks

- Закрыть и заново открыть проект; модель должна остаться доступной.
- Проверить повторную загрузку пустой модели без ошибок десериализации.

## Handoff to Next Issue

### What now works

- Проект содержит настоящую freeform-модель, которую можно открыть на canvas.
- Стабилен базовый lifecycle model file.

### What contract is now stable

- Model schema v1 для пустой freeform-модели.
- Create/open model flow в рамках проекта.

### What next issue can start

- M2-02 может добавлять node editing в уже существующую модель.
- M3-04 и M3-05 позже смогут создавать дочерние и upper-level модели по тем же правилам.

## Done Definition

1. AC-3 выполняется полностью.
2. Create/open freeform model path устойчив и воспроизводим.
3. YAML модели читается и восстанавливается при reopen.
4. Нет blocker-level дефекта, мешающего перейти к node editing.
