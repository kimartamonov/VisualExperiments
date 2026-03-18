# [M1-01] Finalize project manifest and file placement contract

## Metadata

- Issue ID: M1-01
- Type: Decision
- Status: Proposed
- Milestone: M1. Project Foundation
- Capability Slice: CS-01. Project bootstrap
- Priority: P0
- Sequence Order: 1
- Depends On:
  - None
- Unlocks:
  - M1-02
  - M2-01
  - M3-04
  - M3-05
- Decision References:
  - DB-11
  - DB-14
  - DB-18
- FR References:
  - FR-1.1
  - FR-1.2
  - FR-2.1
- AC References:
  - AC-1
  - AC-3
- Demo References:
  - Step 1
  - Step 3
- Risk References:
  - R5

## Goal

- Зафиксировать v1-контракт для `project.yaml` и правила размещения новых модельных файлов.
- Убрать двусмысленность в путях, slug-именах и относительных ссылках до старта implementation issues.

## Why Now

- Без этого решения bootstrap проекта и последующее создание моделей будут опираться на разные правила.
- Cross-model ссылки нельзя безопасно строить, пока не определены стабильные пути и naming rules.
- Этот issue разблокирует весь основной путь до freeform, drill-down и step-up.

## User/System Outcome

- С точки зрения пользователя структура создаваемого проекта предсказуема.
- С точки зрения системы manifest, пути моделей и относительные ссылки имеют единый v1-контракт.
- С точки зрения roadmap появляется стабильная основа для M1 и M2.

## Scope

- Зафиксировать обязательные поля `project.yaml`: `id`, `name`; опциональные `defaultModel`, `notations`.
- Утвердить правило: новые модели создаются в выбранном каталоге дерева или в `models/`, если контекст не выбран.
- Утвердить правило: drill-down по умолчанию создается рядом с родительской моделью, step-up создается по простому предсказуемому правилу в отдельной верхнеуровневой папке или рядом с источником, без использования label как identity.
- Зафиксировать, что file name строится как человекочитаемый slug, а identity обеспечивается полем `id`.
- Зафиксировать адресацию моделей и объектов через относительные пути и стабильные ids.

## Out of Scope

- Реализация rename/move flows для моделей.
- Автоматическая миграция файловой структуры.
- Логическое дерево поверх файлового дерева.

## Preconditions

- Приняты DB-02, DB-03, DB-05 и DB-10.
- Источник истины для данных остается файловая система и YAML.
- Функциональные требования по project/model lifecycle уже зафиксированы в docs.

## Implementation Notes

- Опирайтесь на `09_Data_and_Integrations.md` как на базовый формат путей и YAML.
- Не добавляйте в manifest новые обязательные поля сверх DB-11 без явной причины в docs.
- Правило размещения должно быть достаточно простым для объяснения в UI и для устойчивого reopen.
- Отдельно зафиксируйте, создается ли `notations/` сразу или по требованию при первом notation flow.
- Результат issue должен обновить planning-артефакт, чтобы следующие issues не гадали о path semantics.

## Files and Artifacts Expected to Change

- Planning docs: decision backlog, roadmap notes, issue tree references.
- API contracts for create/open project and create model.
- YAML schema notes for `project.yaml` and path addressing.
- UX copy or helper docs про naming rules.

## Acceptance Criteria for This Issue

- В письменном виде зафиксирован минимальный manifest v1 без новых обязательных полей сверх docs.
- В письменном виде зафиксировано правило размещения файлов для create model, drill-down и step-up.
- Относительные пути, slug names и stable ids описаны без двусмысленности.
- Следующий implementation issue можно начинать без скрытого решения о том, куда писать новые файлы.

## Required Tests

### Functional checks

- Проверить, что решение покрывает create/open project, create model, drill-down и step-up path semantics.
- Проверить, что правило для `defaultModel` совместимо с bootstrap проекта.

### Smoke checks

- Убедиться, что после чтения решения команда может назвать ожидаемое расположение первого model file без дополнительных обсуждений.
- Убедиться, что relative path addressing не конфликтует с требованием stable ids.

### Regression checks

- Проверить, что решение не противоречит `07_Domain_Model.md` и `09_Data_and_Integrations.md`.
- Проверить, что решение не затягивает в MVP rename/move, migration и logical-tree scope.

### Persistence/reload checks

- Подтвердить, что все ссылочные правила ориентированы на устойчивость reopen и не опираются на runtime-only state.

## Handoff to Next Issue

### What now works

- Contract для `project.yaml`, slug names и model placement зафиксирован.
- Правила относительных путей и identities можно считать базой для implementation.

### What contract is now stable

- Manifest v1.
- Relative-path addressing.
- Default placement rules for newly created model files.

### What next issue can start

- M1-02 может реализовывать create/open project flow.
- M2-01, M3-04 и M3-05 позже смогут опираться на одинаковые file placement semantics.

## Done Definition

1. Решение письменно зафиксировано и не оставляет открытого вопроса о размещении новых файлов.
2. Ссылки на DB-11, DB-14 и DB-18 отражены в итоговом артефакте.
3. Следующие implementation issues не требуют дополнительного planning-discussion для старта.
4. Решение не расширяет MVP скрытыми P1/P2 возможностями.