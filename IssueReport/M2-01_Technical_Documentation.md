# M2-01 Technical Documentation

## Purpose

Этот issue вводит первый model-level artifact в системе: пустую freeform-модель, которую можно создать, сохранить как YAML, открыть в workspace и перечитать после reopen.

## Architectural Approach

- Model lifecycle встроен в существующий `ProjectService`, чтобы reuse path rules и manifest update logic не размножались по слоям.
- Backend хранит модель в YAML schema v1:
  - `id`
  - `name`
  - `notation`
  - `nodes`
  - `edges`
  - `frames`
- Frontend не пытается пока рисовать реальные graph objects; center panel становится entry point для будущего canvas.

## Contracts And Data Structures

### REST API

- `POST /api/projects/:projectId/models`
  - body: `{ name, selectedPath }`
  - creates a freeform model in the selected or default directory context.
- `GET /api/projects/:projectId/models?path=...`
  - opens an existing model by project-relative path.

### Model persistence

- First model without valid folder context -> `models/main.yaml`
- Subsequent models -> slug-based path in selected directory or `models/`
- First created model fills `project.yaml.defaultModel` if it was absent.
- YAML collections serialize explicitly as `[]`.

### Frontend state

- `currentModel`: currently opened freeform model.
- `selectedTreePath`: active creation/open context in file tree.
- `modelName`: pending create-model form value.
- `loadingModel` / `submittingModel`: transient model lifecycle UI state.

## Key Logic

- Tree selection doubles as model creation context.
- Clicking an existing model YAML file opens it.
- Creating a model refreshes project tree, re-reads project details, and opens the created model immediately.
- Reopen behavior uses persisted path + YAML read path, not transient UI cache.

## Limitations

- Empty canvas is still a placeholder surface.
- No graph mutation yet.
- No delete/rename model flow.
- No typed model support.

## Integration Points

- `M2-02` builds node editing on top of `currentModel`.
- `M2-03` and `M2-04` reuse the same model YAML persistence contract.
- `M5-01` later validates round-trip integrity for the same model documents.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- freeform model YAML schema v1 for empty models;
- create/open model API;
- first-model `defaultModel` behavior;
- tree refresh and model reopen path in workspace shell.

