# M1-03 Technical Documentation

## Purpose

Этот issue доводит project open flow до рабочего shell: пользователь после открытия проекта видит реальное файловое дерево, а приложение получает стабильный layout для следующих model-level issues.

## Architectural Approach

- Backend остается файлово-ориентированным и строит дерево напрямую из project root без synthetic logical overlay.
- Frontend получает tree как отдельный REST contract, а не вычисляет структуру по косвенным данным manifest.
- Workspace shell разделен на три панели:
  - left: file tree;
  - center: canvas placeholder;
  - right: properties placeholder.

## Contracts And Data Structures

### Tree API

- `GET /api/projects/:projectId/tree`
- Response shape:
  - `name`: локальное имя узла;
  - `path`: путь относительно корня проекта;
  - `kind`: `directory` | `file`;
  - `children`: дочерние узлы для каталогов.

### Tree semantics

- Корневой узел соответствует project root.
- Узлы сортируются как `directories first`, затем по имени.
- Скрытые файлы и каталоги, начинающиеся с `.`, не включаются в tree contract.
- Все пути отдаются в POSIX-формате относительно project root.

### Frontend shell state

- `currentProject`: открытый проектный context.
- `projectTree`: текущее дерево проекта с backend.
- `selectedTreePath`: текущий выбранный узел дерева.
- `loadingTree`: transient state для refresh behavior.

## Key Logic

- Refresh tree перечитывает структуру с backend и сохраняет current selection, если путь все еще существует.
- Если выбранный путь исчез, selection возвращается к `project.yaml`, чтобы shell оставался в валидном состоянии.
- Shell intentionally stops at tree selection and placeholders, чтобы не смешивать M1 foundation с model opening/editing из M2.

## Limitations

- Выбор файла в tree пока не открывает модель на canvas.
- Нет breadcrumbs, back stack и semantic navigation.
- Нет действий создания/удаления файлов из tree.
- Нет отдельного contract для logical hierarchy поверх file tree.

## Integration Points

- `M1-04` использует текущий shell и tree API для milestone validation.
- `M2-01` может использовать tree selection и refresh behavior для create/open freeform model flow.
- `M3-03` позже сможет встроить navigation context в уже стабильный трехпанельный layout.

## Stable Base For Next Issue

Следующий issue может считать стабильными:

- three-panel workspace shell;
- backend file-tree API;
- rendering contract for folders and YAML files;
- refresh path for newly appeared files without layout redesign.

