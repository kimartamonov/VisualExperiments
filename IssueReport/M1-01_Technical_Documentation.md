# M1-01 Technical Documentation

## Purpose

Этот issue фиксирует минимальный файловый контракт MVP, на который дальше опираются bootstrap проекта, создание моделей и cross-model navigation.

## Architectural Approach

- Источник истины остается файловая система и YAML.
- Manifest используется как точка входа в проект, а не как storage runtime-state.
- Все cross-file ссылки используют пути относительно корня проекта.
- Человекочитаемые file names остаются производными от slug, а identity обеспечивается стабильными `id`.

## Contracts And Data Structures

### `project.yaml`

- Required: `id`, `name`
- Optional: `defaultModel`, `notations`
- Empty bootstrap project may contain only:

```yaml
id: project-001
name: My Project
```

### Path contract

- `defaultModel` и `notations[]` хранят project-root-relative paths.
- `Node.drilldowns[]` хранит project-root-relative model paths.
- `Frame.stepUp.model` хранит project-root-relative model path.
- Object addressing follows `modelPath#objectId`.

### Placement contract

- Project bootstrap: create project folder, `project.yaml`, `models/`.
- `notations/`: create on demand at first notation flow.
- Create model: selected directory, or parent directory of selected file, or `models/` if no valid context.
- First model in empty project without context: `models/main.yaml`.
- Drill-down create: same directory as source model.
- Step-up create: `models/abstractions/`, created lazily.

### Slug contract

- Base source: model name, `Node.label` or `Frame.name`.
- Normalize to lowercase kebab-case.
- Remove unsupported v1 characters and collapse duplicate `-`.
- If empty after normalization, use fallback base: `main`, `model`, `drilldown`, `step-up`.
- If path already exists, append numeric suffix.

## Key Logic

- Path readability is a UX aid, not identity.
- Relative paths are stable across reopen and do not depend on the current navigation route.
- `defaultModel` is a start pointer for empty/open flows, not a persisted history of last visited model.
- MVP does not require rename/move synchronization between display names and file names.

## Limitations

- No automatic rename/move flows for models.
- No automatic migration of old project layouts.
- No logical tree overlay above the real file tree.
- Step-up synchronization policy is not solved here; it remains in `DB-17`.

## Integration Points

- `M1-02` consumes the manifest bootstrap contract.
- `M2-01` consumes first-model placement and `defaultModel` rules.
- `M3-04` consumes drill-down child placement and relative-link rules.
- `M3-05` consumes step-up upper-level placement and relative-link rules.
- `M5-01` later validates round-trip persistence for the same path conventions.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- manifest v1 without extra required fields;
- project-root-relative addressing;
- predictable placement rules for create model, drill-down and step-up;
- slug naming that improves readability without replacing stable IDs.
