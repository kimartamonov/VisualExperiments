# [M1-03] Implement workspace shell and project tree

## Metadata

- Issue ID: M1-03
- Type: Implementation
- Status: Proposed
- Milestone: M1. Project Foundation
- Capability Slice: CS-02. Project tree and workspace shell
- Priority: P0
- Sequence Order: 3
- Depends On:
  - M1-02
- Unlocks:
  - M1-04
  - M2-01
  - M3-03
- Decision References:
  - DB-05
  - DB-16
- FR References:
  - FR-1.3
  - FR-10.1
- AC References:
  - AC-2
- Demo References:
  - Step 2
- Risk References:
  - R4

## Goal

- Дать пользователю трехпанельное рабочее пространство проекта с реальным файловым деревом.
- Подготовить устойчивый layout, на который потом лягут canvas, properties и navigation context.

## Why Now

- После create/open project пользователь должен увидеть рабочую среду, а не только факт существования папки.
- File tree нужен как опора для model lifecycle, drill-down и step-up flows.
- Без shell layout дальнейшие editor slices будут вынуждены переделывать базовую компоновку.

## User/System Outcome

- Пользователь видит левую панель с реальной структурой проекта, центральную область под canvas и правую панель под свойства.
- Система умеет получать tree from backend и отображать YAML-файлы и папки без логической интерпретации сверх docs.
- Roadmap получает готовый entry point для model-opening behavior.

## Scope

- Реализовать трехпанельный workspace shell.
- Показать в левой панели проектное файловое дерево.
- Отображать папки и YAML-файлы проекта на основе backend tree API.
- Подготовить центральную и правую панели как устойчивые контейнеры для следующих milestones.
- Обновлять дерево после появления новых файлов проекта.

## Out of Scope

- Логическое дерево поверх файлового.
- Breadcrumbs/back stack для cross-model navigation.
- Полноценное открытие моделей на canvas.

## Preconditions

- M1-02 завершил create/open flow проекта.
- Project root на диске отражает manifest и каталоги по согласованному контракту.
- Навигационная модель высокого уровня ограничена file tree на этом этапе.

## Implementation Notes

- Левая панель должна отражать реальную FS-структуру, а не synthetic structure.
- Центр и правая панель могут пока содержать placeholder behavior, если layout стабилен.
- Не смешивайте file tree и semantic navigation в одном issue.
- Продумайте обновление дерева после create model так, чтобы M2 не требовал нового layout.

## Files and Artifacts Expected to Change

- Frontend workspace layout components.
- Backend project tree endpoint or filesystem reader.
- UI state for current project/workspace shell.
- Docs or test artifacts describing tree refresh behavior.

## Acceptance Criteria for This Issue

- После открытия проекта пользователь видит трехпанельный layout.
- Левая панель отображает реальные папки и YAML-файлы проекта.
- При появлении нового model file дерево может быть обновлено и показать его без смены архитектуры shell.
- Центральная и правая панели готовы к размещению canvas и properties.

## Required Tests

### Functional checks

- Открыть проект и проверить наличие трех панелей.
- Проверить отображение файлов и папок из project root.
- Проверить обновление дерева после изменения состава файлов проекта.

### Smoke checks

- Переключиться между несколькими проектами, не вызывая crash или потери shell layout.
- Проверить, что пустой проект отображается корректно.

### Regression checks

- Убедиться, что M1-02 create/open project flow остался рабочим.
- Убедиться, что file tree не создает ложных логических сущностей поверх FS.

### Navigation checks

- Проверить, что текущий project context сохраняется при перерисовке layout.

## Handoff to Next Issue

### What now works

- У проекта есть рабочее пространство с file tree и местом для canvas/properties.
- Проектная структура наблюдаема пользователем через UI.

### What contract is now stable

- Workspace shell layout.
- File-tree API and rendering behavior.

### What next issue can start

- M1-04 может валидировать весь foundation flow end-to-end.
- M2-01 может добавлять create/open freeform model в уже готовое workspace shell.

## Done Definition

1. AC-2 выполняется полностью.
2. Layout не требует переделки для старта model-level issues.
3. File tree отражает реальную структуру проекта.
4. Нет критического дефекта, мешающего пройти demo step 2.