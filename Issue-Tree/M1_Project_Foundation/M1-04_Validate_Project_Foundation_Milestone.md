# [M1-04] Validate project foundation milestone

## Metadata

- Issue ID: M1-04
- Type: Validation
- Status: Proposed
- Milestone: M1. Project Foundation
- Capability Slice: CS-01. Project bootstrap
- Priority: P0
- Sequence Order: 4
- Depends On:
  - M1-02
  - M1-03
- Unlocks:
  - M1-05
  - M2-01
- Decision References:
  - DB-24
- FR References:
  - FR-1.1
  - FR-1.2
  - FR-1.3
  - FR-10.1
- AC References:
  - AC-1
  - AC-2
- Demo References:
  - Step 1
  - Step 2
- Risk References:
  - R5

## Goal

- Проверить, что foundation milestone дает рабочий, воспроизводимый вход в продукт.
- Зафиксировать найденные blockers до перехода к model/canvas issues.

## Why Now

- M2 не должен строиться на нестабильном create/open или шатком shell layout.
- Этот issue закрывает обязательный validation gate milestone.
- Найденные дефекты должны превратиться в явный bugfix issue, а не раствориться в следующих implementation tasks.

## User/System Outcome

- Пользователь может стабильно пройти первые два шага демо-сценария.
- Система подтверждает корректность bootstrap, open и workspace shell как базы для следующих slices.
- Roadmap получает формальный exit gate для M1.

## Scope

- Ручной проход AC-1 и AC-2.
- Проверка demo steps 1-2 end-to-end.
- Проверка reopen только что созданного проекта.
- Фиксация pass/fail и списка critical/high findings.

## Out of Scope

- Исправление найденных дефектов внутри этого issue.
- Создание моделей и canvas behavior.
- UX-polish, не влияющий на acceptance.

## Preconditions

- M1-02 и M1-03 завершены.
- Manifest contract и file placement rules зафиксированы.
- Подготовлен минимальный тестовый проект или сценарий ручной проверки.

## Implementation Notes

- Ведите validation как acceptance pass, а не как exploratory scope expansion.
- Фиксируйте только реальные blockers и заметные high-severity defects.
- Если обнаружен новый скрытый decision, его нужно явно записать, а не замаскировать под implementation bug.

## Files and Artifacts Expected to Change

- Validation notes, checklist or acceptance log.
- Demo evidence for steps 1-2.
- Bug list feeding M1-05 if needed.

## Acceptance Criteria for This Issue

- AC-1 и AC-2 проверены вручную по чек-листу.
- Demo steps 1-2 пройдены в связке без обходных маневров.
- Все critical/high findings зафиксированы как конкретные defects с reproduction notes.
- Ясно определено, готов ли milestone к переходу в M2.

## Required Tests

### Functional checks

- Создать новый проект и открыть его.
- Проверить отображение файлового дерева и shell layout.

### Smoke checks

- Повторить create/open flow минимум дважды.
- Открыть существующий проект после закрытия приложения или перезапуска workspace.

### Regression checks

- Убедиться, что shell layout не ломает create/open path.
- Убедиться, что file tree не теряет manifest или `models/` при reopen.

### Persistence/reload checks

- Повторно открыть только что созданный проект и подтвердить целостность структуры.

## Handoff to Next Issue

### What now works

- Foundation flow проверен на реальном пользовательском сценарии.
- Известные blockers, если есть, явно зафиксированы.

### What contract is now stable

- Вход в проект и file-tree workspace можно считать опорой для model lifecycle.

### What next issue can start

- M1-05 может закрыть обнаруженные blockers.
- При отсутствии blockers M2-01 может стартовать немедленно.

## Done Definition

1. Validation result оформлен как pass/fail с findings.
2. Demo steps 1-2 проверены вручную.
3. Нет незафиксированных critical/high дефектов.
4. Переход к M2 либо разрешен, либо остановлен с понятной причиной.