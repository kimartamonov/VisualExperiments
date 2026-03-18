# 14. Capability Slice Map

## Назначение документа

Этот документ переводит существующие спецификации в набор **вертикальных capability slices**, из которых затем собираются milestones и последовательные issues.

Он нужен для того, чтобы:

- декомпозировать MVP по пользовательским результатам, а не по техническим слоям;
- удерживать фокус на сквозном demo flow;
- заранее показать зависимости между slices;
- определить, какие slices являются обязательными для MVP, а какие можно вынести в optional/stretch.

---

## Принцип слайсинга

### Slicing Rule 1. Slice должен давать проверяемую пользовательскую возможность

Не "сделать backend для моделей", а "пользователь может создать и открыть модель".

### Slicing Rule 2. Slice проходит через все нужные слои сразу

Если для результата нужны schema, API, state, UI и save/reload, они входят в один slice или в тесно связанный issue cluster внутри него.

### Slicing Rule 3. Slice должен иметь опору в FR, AC и demo steps

Иначе он превращается в техническую активность без понятного product outcome.

### Slicing Rule 4. Slice не должен скрывать нерешенный product/architecture decision

Если есть блокирующая неопределенность, сначала создается `Decision` или `Spike`, а не implementation issue.

### Slicing Rule 5. Scope reduction должен происходить по заранее определенным cut lines

Если не хватает времени или энергии, нужно упростить slice предсказуемо, а не размывать acceptance.

---

## Каркас roadmap

Capability slices группируются в 5 milestones, согласованных с уже существующим delivery plan.

| Milestone | Назначение | Основной результат |
|---|---|---|
| M1. Project Foundation | Создать рабочее пространство проекта и файловый backend | Можно создать проект, открыть его и увидеть структуру |
| M2. Freeform Modeling Workspace | Дать полноценный freeform canvas | Можно создать freeform-модель и редактировать диаграмму |
| M3. Hierarchy and Semantic Navigation | Поддержать движение по уровням абстракции | Работают frame, drill-down, step-up и обратная навигация |
| M4. Typing and Notation Workflow | Превратить freeform в reusable modeling language | Работают типизация, создание нотации и typed-модель |
| M5. Stability and Demo Readiness | Сделать MVP устойчивым для ручной приемки | Проходит сквозной демо-сценарий без критических сбоев |

---

## Readiness gate перед roadmap

Перед стартом implementation issues должны быть закрыты или приняты в provisional виде следующие решения:

- `DB-11` Manifest schema v1
- `DB-12` Model schema v1
- `DB-13` Notation schema v1
- `DB-14` Stable IDs and references
- `DB-18` File naming and placement rules

Это не отдельный milestone продукта, а **planning gate**, после которого roadmap можно безопасно резать на issues.

---

## Состав capability slices

### CS-01. Project bootstrap

- `Milestone`: M1
- `User outcome`: пользователь может создать новый проект и попасть в рабочее пространство проекта.
- `Includes`:
  - создание папки проекта;
  - создание `project.yaml`;
  - создание каталога `models/`;
  - базовый API для create/open project.
- `Primary FR`:
  - FR-1.1
  - FR-1.2
- `Primary AC`:
  - AC-1
- `Demo steps`:
  - Step 1
- `Required decisions`:
  - DB-11
  - DB-18
- `Dependencies`: нет
- `Exit evidence`:
  - проект появляется в списке;
  - проект открывается;
  - manifest читается с диска.
- `Out of scope`:
  - folders inside project;
  - model creation;
  - autosave.
- `Scope reduction rule`:
  - если список проектов еще не идеален по UX, главное чтобы create/open работал устойчиво.

### CS-02. Project tree and workspace shell

- `Milestone`: M1
- `User outcome`: пользователь видит трехпанельное рабочее пространство и реальную файловую структуру проекта.
- `Includes`:
  - shell editor workspace;
  - левая панель с файловым деревом;
  - центральная область под canvas;
  - правая панель под свойства;
  - получение project tree с backend.
- `Primary FR`:
  - FR-1.3
  - FR-10.1
- `Primary AC`:
  - AC-2
- `Demo steps`:
  - Step 2
- `Required decisions`:
  - DB-05
  - DB-16
- `Dependencies`:
  - CS-01
- `Exit evidence`:
  - структура папок и YAML-файлов отображается слева;
  - shell позволяет открыть модель позже без перестройки layout.
- `Out of scope`:
  - logical tree поверх file tree;
  - детальная semantic navigation.

### CS-03. Model lifecycle and freeform bootstrap

- `Milestone`: M2
- `User outcome`: пользователь может создать и открыть freeform-модель.
- `Includes`:
  - create model API;
  - YAML-файл модели с `notation: freeform`;
  - открытие модели в canvas;
  - базовый model context.
- `Primary FR`:
  - FR-2.1
  - FR-2.3
  - FR-2.6
- `Primary AC`:
  - AC-3
- `Demo steps`:
  - Step 3
- `Required decisions`:
  - DB-12
  - DB-18
- `Dependencies`:
  - CS-01
  - CS-02
- `Exit evidence`:
  - новая модель появляется в дереве;
  - открывается пустой canvas;
  - файл модели сохраняется на диск.
- `Out of scope`:
  - typed model;
  - rename model;
  - notation attachment.

### CS-04. Node editing

- `Milestone`: M2
- `User outcome`: пользователь может создавать, двигать, редактировать и удалять ноды.
- `Includes`:
  - контекстное меню canvas;
  - create node;
  - drag-and-drop;
  - edit label;
  - edit description;
  - delete node;
  - persist positions and properties.
- `Primary FR`:
  - FR-3.1
  - FR-3.2
  - FR-3.3
  - FR-3.4
  - FR-3.5
- `Primary AC`:
  - AC-4
- `Demo steps`:
  - Step 4
- `Required decisions`:
  - DB-12
  - DB-15
- `Dependencies`:
  - CS-03
- `Exit evidence`:
  - нода создается через UI;
  - позиция сохраняется после reload;
  - delete каскадно очищает зависимости, где это требуется.
- `Out of scope`:
  - typed node picker;
  - complex styling.

### CS-05. Edge editing

- `Milestone`: M2
- `User outcome`: пользователь может связывать ноды направленными edges и удалять связи.
- `Includes`:
  - create directed edge;
  - delete edge;
  - persist edge list.
- `Primary FR`:
  - FR-4.1
  - FR-4.3
- `Primary AC`:
  - AC-5
- `Demo steps`:
  - Step 4
- `Required decisions`:
  - DB-09
  - DB-12
- `Dependencies`:
  - CS-04
- `Exit evidence`:
  - edge visually rendered;
  - source/target корректны после reopen.
- `Out of scope`:
  - typed edges;
  - advanced routing;
  - labels как обязательная часть MVP.

### CS-06. Frame as semantic container

- `Milestone`: M2
- `User outcome`: пользователь может выделить группу нод во frame и подготовить их к step-up.
- `Includes`:
  - create frame;
  - name and description for frame;
  - add/remove nodes to frame;
  - сохранение состава frame.
- `Primary FR`:
  - FR-5.1
  - FR-5.2
  - FR-5.3
- `Primary AC`:
  - AC-6
- `Demo steps`:
  - Step 5
- `Required decisions`:
  - DB-12
- `Dependencies`:
  - CS-04
  - CS-05
- `Exit evidence`:
  - frame сохраняется как семантическая сущность, а не только визуальный rectangle.
- `Out of scope`:
  - автоматическая синхронизация со step-up;
  - typed frame semantics.

### CS-07. Drill-down creation and navigation

- `Milestone`: M3
- `User outcome`: пользователь может привязать к ноде дочернюю модель, перейти в нее и вернуться назад.
- `Includes`:
  - section drill-down в properties panel;
  - create/link child model;
  - open linked model;
  - back and breadcrumbs для возврата;
  - broken link handling.
- `Primary FR`:
  - FR-6.1
  - FR-6.2
  - FR-6.3
  - FR-10.2
  - FR-10.3
- `Primary AC`:
  - AC-7
- `Demo steps`:
  - Step 8
  - Step 9
- `Required decisions`:
  - DB-06
  - DB-16
  - DB-18
  - DB-20
- `Dependencies`:
  - CS-03
  - CS-04
  - CS-02
- `Exit evidence`:
  - дочерняя модель создается или привязывается;
  - навигация туда и обратно воспроизводима;
  - отсутствующая модель дает понятный recovery path.
- `Out of scope`:
  - multi-user linked editing;
  - semantic validation child model contents.

### CS-08. Step-up generation and upper-level navigation

- `Milestone`: M3
- `User outcome`: пользователь может поднять frame на верхний уровень и перейти между представлениями.
- `Includes`:
  - action `step-up` на frame;
  - создание верхнеуровневой модели;
  - создание представительной ноды в новой модели;
  - связь frame ↔ upper-level node;
  - переход вверх и обратный переход вниз/назад.
- `Primary FR`:
  - FR-7.1
  - FR-7.2
  - FR-7.3
  - FR-10.2
  - FR-10.3
- `Primary AC`:
  - AC-8
- `Demo steps`:
  - Step 6
  - Step 7
- `Required decisions`:
  - DB-16
  - DB-17
  - DB-18
- `Dependencies`:
  - CS-06
  - CS-03
- `Exit evidence`:
  - создается верхнеуровневая модель;
  - у frame есть осмысленная step-up ссылка;
  - навигация работает в обе стороны.
- `Out of scope`:
  - live sync representation;
  - автоматическая реконфигурация upper-level graph по всем изменениям frame.
- `Scope reduction rule`:
  - если step-up слишком сложен, допускается сначала one-shot generation, но milestone не закрыт, пока навигация и link semantics не устойчивы.

### CS-09. Multiple drill-down support

- `Milestone`: M3
- `User outcome`: одна нода может иметь несколько альтернативных детализаций.
- `Includes`:
  - отображение списка drill-down links;
  - выбор нужной модели для перехода;
  - add/remove link без удаления самой модели.
- `Primary FR`:
  - FR-6.4
  - FR-6.5
- `Primary AC`:
  - часть AC-7
- `Demo steps`:
  - не входит в обязательный 14-step flow, но относится к MVP scope
- `Required decisions`:
  - DB-22
- `Dependencies`:
  - CS-07
- `Exit evidence`:
  - data model поддерживает список ссылок;
  - UI не ломается при более чем одной детализирующей модели.
- `Out of scope`:
  - автоматические рекомендации drill-down по notation.
- `Priority note`:
  - slice обязателен по FR, но может идти после single drill-down happy path.

### CS-10. Late typing in freeform models

- `Milestone`: M4
- `User outcome`: пользователь может назначать типы нодам после построения диаграммы.
- `Includes`:
  - assign type;
  - change type;
  - remove type;
  - color reflection на canvas.
- `Primary FR`:
  - FR-8.1
  - FR-8.2
  - FR-8.3
- `Primary AC`:
  - AC-9
- `Demo steps`:
  - Step 10
- `Required decisions`:
  - DB-13
  - DB-19
  - DB-23
- `Dependencies`:
  - CS-04
  - CS-03
- `Exit evidence`:
  - типизация не ломает positions, links, frames;
  - визуальное отличие типов видно на canvas.
- `Out of scope`:
  - constraint validation;
  - typed edges.

### CS-11. Notation extraction from model

- `Milestone`: M4
- `User outcome`: пользователь может зафиксировать найденные типы как reusable notation.
- `Includes`:
  - create notation from current model;
  - извлечение уникальных типов и цветов;
  - создание YAML-файла в `notations/`;
  - обновление manifest;
  - связывание текущей модели с новой нотацией.
- `Primary FR`:
  - FR-9.1
- `Primary AC`:
  - AC-10
- `Demo steps`:
  - Step 11
- `Required decisions`:
  - DB-11
  - DB-13
  - DB-19
- `Dependencies`:
  - CS-10
  - CS-01
- `Exit evidence`:
  - notation file существует на диске;
  - manifest содержит ссылку на него;
  - текущая модель остается доступной и целой.
- `Out of scope`:
  - manual notation editing UI;
  - deep normalization of bad type names.

### CS-12. Typed model creation from notation

- `Milestone`: M4
- `User outcome`: пользователь может создать новую модель по существующей нотации и использовать ее типы.
- `Includes`:
  - create typed model flow;
  - выбор нотации при создании;
  - typed node picker в context menu;
  - применение type/color на node creation.
- `Primary FR`:
  - FR-2.2
  - FR-9.2
- `Primary AC`:
  - AC-11
- `Demo steps`:
  - Step 12
  - Step 13
- `Required decisions`:
  - DB-13
  - DB-23
- `Dependencies`:
  - CS-11
  - CS-04
- `Exit evidence`:
  - typed model создается и сохраняется;
  - ноды создаются из списка типов нотации.
- `Out of scope`:
  - strict notation conformance;
  - default diagram templates per notation.

### CS-13. Save, reload and persistence integrity

- `Milestone`: M5
- `User outcome`: пользователь не теряет структуру проекта после сохранения и повторного открытия.
- `Includes`:
  - reliable manual save;
  - reopen project/model;
  - integrity checks для nodes, edges, frames, drill-down, step-up, types, notations.
- `Primary FR`:
  - FR-2.6
  - FR-11.1
  - FR-11.2
- `Primary AC`:
  - AC-12
- `Demo steps`:
  - Step 14
- `Required decisions`:
  - DB-03
  - DB-15
  - DB-21
- `Dependencies`:
  - CS-03 through CS-12
- `Exit evidence`:
  - project survives reopen without structural loss;
  - data round-trip through YAML stable enough for acceptance.
- `Out of scope`:
  - version history;
  - conflict resolution beyond last-write-wins.

### CS-14. Error handling and recovery

- `Milestone`: M5
- `User outcome`: система не падает на битых данных и дает понятный путь восстановления.
- `Includes`:
  - invalid YAML error surface;
  - missing model handling;
  - missing notation fallback;
  - non-crashing load errors.
- `Primary FR`:
  - FR-11.1
  - FR-11.2
- `Primary AC`:
  - AC-13
- `Demo steps`:
  - поддерживает весь сценарий косвенно
- `Required decisions`:
  - DB-20
- `Dependencies`:
  - CS-07
  - CS-08
  - CS-11
  - CS-13
- `Exit evidence`:
  - приложение не падает на одном плохом файле;
  - ошибки локализованы и объяснимы пользователю.

### CS-15. Demo hardening and acceptance pass

- `Milestone`: M5
- `User outcome`: заказчик может пройти сквозной сценарий end-to-end без критических блокеров.
- `Includes`:
  - smoke pass по milestones;
  - full 14-step demo pass;
  - bugfix loop по критическим и высоким дефектам.
- `Primary FR`: все P0
- `Primary AC`: AC-1 ... AC-13
- `Demo steps`: Step 1 ... Step 14
- `Required decisions`:
  - DB-24
- `Dependencies`:
  - все обязательные capability slices
- `Exit evidence`:
  - демонстрационный сценарий проходит полностью;
  - отсутствуют critical defects из acceptance matrix.

---

## Optional / stretch slices

Эти slices полезны, но не входят в минимальный критический путь к рабочему MVP.

### OCS-01. Folder management inside project

- `FR`: FR-1.4
- `Why optional`: улучшает организацию проекта, но не блокирует demo flow.

### OCS-02. Model rename and notation reassignment

- `FR`: FR-2.4, FR-2.5
- `Why optional`: удобно, но можно отложить до стабилизации core graph workflow.

### OCS-03. Context panel for model-level properties

- `FR`: FR-10.4
- `Why optional`: полезно для UX, но не обязательно для прохождения demo.

### OCS-04. Autosave

- `FR`: FR-2.7
- `Why optional`: желателен, но явно не обязателен для приемки MVP.

### OCS-05. Edge labels and frame deletion polish

- `FR`: FR-4.2, FR-5.4
- `Why optional`: не влияет на главную гипотезу.

---

## Зависимости между slices

### Базовая цепочка

`CS-01 -> CS-02 -> CS-03 -> CS-04 -> CS-05 -> CS-06`

Это фундамент, без которого не начинается настоящий semantic workflow.

### Навигационная ветка

`CS-03 + CS-04 + CS-02 -> CS-07 -> CS-09`

### Абстракционная ветка

`CS-06 + CS-03 -> CS-08`

### Типизационная ветка

`CS-04 -> CS-10 -> CS-11 -> CS-12`

### Стабилизационная ветка

`CS-03 ... CS-12 -> CS-13 -> CS-14 -> CS-15`

---

## Сборка milestones

### M1. Project Foundation

- `Includes`: CS-01, CS-02
- `Exit condition`:
  - можно создать и открыть проект;
  - видна файловая структура;
  - workspace shell готов для editor flow.

### M2. Freeform Modeling Workspace

- `Includes`: CS-03, CS-04, CS-05, CS-06
- `Exit condition`:
  - можно создать freeform-модель;
  - можно нарисовать базовую диаграмму;
  - frame существует как semantic container.

### M3. Hierarchy and Semantic Navigation

- `Includes`: CS-07, CS-08, CS-09
- `Exit condition`:
  - работают drill-down и step-up;
  - back/breadcrumbs поддерживают переходы;
  - data model готов к нескольким drill-down.

### M4. Typing and Notation Workflow

- `Includes`: CS-10, CS-11, CS-12
- `Exit condition`:
  - можно назначить типы;
  - можно создать нотацию;
  - можно создать typed-модель по нотации.

### M5. Stability and Demo Readiness

- `Includes`: CS-13, CS-14, CS-15
- `Exit condition`:
  - сквозной демо-сценарий проходит полностью;
  - ошибки обрабатываются без краша;
  - структура данных сохраняется после reopen.

---

## Рекомендуемые cut lines при нехватке ресурсов

Если необходимо упростить план без разрушения MVP logic, сокращение должно идти так:

1. Отложить `OCS-04 Autosave`, оставив надежное ручное сохранение.
2. Реализовать `CS-07` single drill-down path раньше полного `CS-09`, но не забыть закрыть multi-drilldown до финальной приемки.
3. Для `CS-08` выбрать упрощенную semantics step-up без live sync.
4. Минимизировать rich UX в M1-M4, сохранив строгую работоспособность core flows.
5. Не сокращать `CS-03`, `CS-04`, `CS-07`, `CS-08`, `CS-10`, `CS-11`, `CS-12`, `CS-13`.

---

## Что должно получиться на уровне backlog

После этого документа каждый capability slice должен быть разложен в последовательность issues следующего класса:

- decision issue, если есть pending decision;
- spike issue, если нужна короткая проверка технической гипотезы;
- implementation issues по slice;
- validation issue на acceptance fragment;
- bugfix issues по найденным блокерам.

Именно это преобразование задается следующим документом: `15_Issue_Decomposition_Rules.md`.
