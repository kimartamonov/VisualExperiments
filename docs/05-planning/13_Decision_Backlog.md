# 13. Decision Backlog

## Назначение документа

Этот документ является переходным слоем между существующим пакетом спецификаций и будущим деревом последовательных Issues.

Его задача:

- зафиксировать архитектурные и продуктовые решения, которые уже достаточно определены для MVP;
- явно отделить принятые решения от временно открытых;
- показать, какие решения влияют на порядок roadmap и на структуру backlog;
- превратить разрозненные open questions из discovery, requirements, solution и delivery в управляемый decision backlog.

Документ **не заменяет** ADR, требования или roadmap. Он отвечает на другой вопрос: какие решения уже можно считать опорой для декомпозиции, а какие сначала нужно закрыть через decision/spike issues.

---

## Источники

Decision backlog основан на материалах из:

- `01_Project_Brief`
- `02_Scope_and_Boundaries`
- `03_Stakeholders_and_Users`
- `04_User_Scenarios_and_Use_Cases`
- `05_Functional_Requirements`
- `06_Nonfunctional_Requirements`
- `07_Domain_Model`
- `08_System_Context_and_Architecture`
- `09_Data_and_Integrations`
- `10_Roadmap_and_Delivery_Plan`
- `11_Acceptance_Criteria_and_Test_Strategy`
- `12_Risks_Decisions_Open_Questions`

---

## Как использовать документ

При построении roadmap и issues действуют следующие правила:

- `Accepted for MVP` означает, что решение можно использовать как основу для implementation issues без дополнительных согласований.
- `Accepted provisional` означает, что решение достаточно для старта, но его формулировка может уточняться без смены направления архитектуры.
- `Pending` означает, что перед связанными implementation issues должен появиться `Decision` или `Spike` issue.
- `Deferred post-MVP` означает, что вопрос **не должен** затягиваться в MVP backlog и не должен дробить milestone на лишние задачи.

Если по ходу разработки появляется противоречие между этим документом и функциональными требованиями, приоритет такой:

1. Scope and boundaries MVP
1. Functional requirements и acceptance criteria
3. ADR и архитектурный контекст
4. Decision backlog как слой операционализации

---

## Принципы принятия решений для MVP

### P1. Проверка гипотезы важнее полноты платформы

Решения должны помогать пройти сквозной демонстрационный сценарий, а не заранее строить универсальную modeling platform.

### P2. Один мир для freeform и typed

Freeform- и typed-модели используют один базовый формат данных и один canvas. Различия должны быть минимальными и сосредоточены в семантическом слое.

### P3. Файлы являются частью архитектуры

Папки, YAML-файлы и относительные ссылки являются не технической деталью, а частью пользовательской модели проекта.

### P4. React Flow является визуальным substrate, а не носителем доменной логики

Навигация, типизация, drill-down, step-up и преобразования данных должны жить вне canvas-библиотеки.

### P5. Любая спорная сложность должна быть вытолкнута из MVP, если она не влияет на ключевую гипотезу

Typed edges, notation editor, collaboration, versioning, integrations и сложная метамодельная логика не должны попадать в критический путь.

### P6. Решения должны вести к issues, а не к дискуссиям без выхода

Каждое pending-решение должно иметь понятную точку закрытия: stage, milestone или slice, до которого оно обязано быть определено.

---

## Статусы решений

| Статус | Смысл |
|---|---|
| Accepted for MVP | Решение зафиксировано и должно использоваться как базовое |
| Accepted provisional | Решение зафиксировано для старта, допускает уточнение без смены направления |
| Pending | Нужно принять до или внутри указанного этапа |
| Deferred post-MVP | Сознательно не решается в рамках MVP |
| Rejected for MVP | Явно не допускается в MVP |

---

## Сводка принятых решений

| ID | Решение | Статус | Влияние на roadmap |
|---|---|---|---|
| DB-01 | Технологический стек MVP: React + TypeScript + React Flow + Node.js + REST | Accepted for MVP | Фиксирует substrate и исключает пересборку стека |
| DB-02 | Хранение на файловой системе без БД | Accepted for MVP | Stage 1 начинается с файлового backend, а не data platform |
| DB-03 | YAML как source of truth для project/model/notation | Accepted provisional | Все slices обязаны учитывать reload и читабельность файлов |
| DB-04 | Единая доменная модель для freeform и typed | Accepted for MVP | Исключает раздвоение roadmap на два редактора |
| DB-05 | Проектовая структура как реальные папки и YAML-файлы | Accepted for MVP | Левое дерево и backend строятся вокруг реальной FS |
| DB-06 | Drill-down реализуется ссылками, а не вложенностью React Flow | Accepted for MVP | Навигация выносится в Model Semantics Layer |
| DB-07 | Нотации не редактируются в UI в MVP | Accepted for MVP | Сильно упрощает milestone типизации |
| DB-08 | Однопользовательский режим, без ролей и collaboration | Accepted for MVP | Убирает блокировки по sync/auth/domain permissions |
| DB-09 | Typed edges и формальная валидация не входят в MVP | Accepted for MVP | Сужает предметную модель и UI |
| DB-10 | Last-write-wins при внешних конфликтах файлов | Accepted for MVP | Исключает конфликт-резолвинг из critical path |

---

## Сводка решений, критичных для декомпозиции

| ID | Вопрос | Статус | До какого момента закрыть | Блокирует |
|---|---|---|---|---|
| DB-11 | Финальный состав `project.yaml` v1 | Accepted for MVP | Закрыто в M1-01 | Project foundation issues |
| DB-12 | Финальная схема `model.yaml` v1 | Accepted provisional | До начала Milestone 2 | Canvas, save/reload, links |
| DB-13 | Финальная схема `notation.yaml` v1 | Accepted provisional | До начала Milestone 4 | Notation extraction, typed model |
| DB-14 | Политика stable IDs и ссылок | Accepted for MVP | Немедленно | Все cross-file операции |
| DB-15 | Граница между persisted state и transient UI state | Accepted provisional | До начала Milestone 2 | Save/reload, acceptance |
| DB-16 | Навигационная модель `tree + breadcrumbs + back` | Accepted provisional | До начала Milestone 3 | Drill-down и step-up issues |
| DB-17 | Семантика синхронизации `frame` и `step-up` | Accepted for MVP | Закрыто в M3-01 | Step-up implementation |
| DB-18 | Правила именования и размещения новых файлов моделей | Accepted for MVP | Закрыто в M1-01 | Create/open/save model flow |
| DB-19 | Правила извлечения нотации из модели | Accepted provisional | До начала Milestone 4 | Create notation issues |
| DB-20 | Политика fallback при битых ссылках и невалидном YAML | Accepted for MVP | До hardening milestone | Reliability issues |

---

## Детализация решений

### DB-01. Базовый технологический стек MVP

- `Title`: React + TypeScript + React Flow + Node.js + REST
- `Status`: Accepted for MVP
- `Why this matters`: если стек открыт, roadmap разваливается на альтернативные реализации UI, canvas и backend.
- `Decision`:
  - frontend: React + TypeScript;
  - canvas: React Flow;
  - backend: Node.js + TypeScript;
  - transport: REST API c JSON;
  - persistence: файловая система.
- `Impact on architecture`:
  - выделяется `Diagram Engine Layer` как thin substrate;
  - бизнес-логика уходит в `Model Semantics Layer`;
  - persistence изолируется за REST API.
- `Impact on roadmap/issues`:
  - не создавать issues на оценку альтернатив canvas/UI frameworks;
  - не планировать generic plugin API;
  - spike на замену React Flow не допускается без нового продуктового решения.
- `Related docs`: 08, 10, 12

### DB-02. Файловое хранение без БД

- `Status`: Accepted for MVP
- `Decision`: проект хранится как папка, данные сохраняются в YAML-файлы, база данных не используется.
- `Rationale`:
  - соответствует пользовательскому ожиданию "проект как переносимая папка";
  - минимизирует инфраструктурную сложность;
  - поддерживает ручное редактирование через VS Code.
- `Impact on roadmap/issues`:
  - M1 обязан включать файловый backend, manifest и tree;
  - save/reload является обязательной частью каждого slice, который изменяет данные;
  - нельзя планировать DB migration как prerequisite для MVP.
- `Related docs`: 02, 08, 09, 12

### DB-03. YAML как источник истины

- `Status`: Accepted provisional
- `Decision`: YAML остается форматом v1 для manifest, models и notations.
- `Clarification`:
  - frontend работает с in-memory копией;
  - backend выполняет parse/serialize;
  - reload всегда восстанавливает данные из файлов.
- `Why provisional`: документы допускают возможный переход на JSON/SQLite, но не в MVP.
- `Impact on roadmap/issues`:
  - во всех implementation issues, меняющих модель данных, нужен критерий "сохраняется и повторно открывается";
  - отдельные issues на смену формата хранения не входят в MVP.
- `Related docs`: 06, 08, 09, 10, 12

### DB-04. Единая доменная модель для freeform и typed

- `Status`: Accepted for MVP
- `Decision`: и freeform, и typed-модели используют один формат `Model`; различие задается полем `notation`.
- `Consequences`:
  - freeform не рассматривается как временный черновик;
  - typed не требует отдельного editor mode на уровне persistence;
  - операции save/open/reload работают одинаково для обоих режимов.
- `Impact on roadmap/issues`:
  - не дробить roadmap на отдельные архитектуры "freeform editor" и "typed editor";
  - issue на typed behavior должен опираться на расширение уже существующего canvas flow.
- `Related docs`: 01, 05, 07, 08

### DB-05. Реальная файловая структура проекта как часть UX

- `Status`: Accepted for MVP
- `Decision`:
  - проект = папка верхнего уровня;
  - `project.yaml` в корне;
  - `models/` и `notations/` как отдельные каталоги;
  - подпапки внутри `models/` допустимы.
- `Consequences`:
  - левая панель показывает реальную файловую структуру;
  - logical tree не подменяет file tree в MVP.
- `Impact on roadmap/issues`:
  - M1 должен закрыть project tree раньше сложной навигации по смысловым уровням;
  - issues на folders/model create/open должны менять реальный FS layout.
- `Related docs`: 02, 07, 09

### DB-06. Drill-down как ссылочная навигация, а не вложенность canvas

- `Status`: Accepted for MVP
- `Decision`: drill-down хранится как ссылки из `Node.drilldowns` на относительные пути моделей.
- `Rationale`:
  - вложенность React Flow не подтверждена как подходящий механизм;
  - ссылочный подход проще, устойчивее и соответствует файловой архитектуре.
- `Consequences`:
  - navigation stack важнее tree nesting;
  - canvas не управляет иерархией сам по себе.
- `Impact on roadmap/issues`:
  - нужна явная навигация через properties panel, breadcrumbs и back;
  - любые issues на "nested canvas" не входят в MVP.
- `Related docs`: 08, 12

### DB-07. Нотации не редактируются визуально в UI

- `Status`: Accepted for MVP
- `Decision`: нотация создается автоматически из модели или редактируется вручную во внешнем редакторе.
- `Consequences`:
  - в M4 не появляются issues на notation designer;
  - scope нотации ограничен списком object types и их цветов.
- `Impact on roadmap/issues`:
  - "Create notation from model" должен быть отдельным capability slice;
  - ручное редактирование YAML допускается, но не является first-class UX path.
- `Related docs`: 02, 07, 12

### DB-08. Однопользовательский режим и отсутствие ролей

- `Status`: Accepted for MVP
- `Decision`: collaboration, roles, permissions и multi-user sync отсутствуют.
- `Impact on roadmap/issues`:
  - исключаются issues на live sync, lock management, merge resolution;
  - остается только simple access stub при необходимости.
- `Related docs`: 01, 02, 06, 12

### DB-09. Typed edges, формальная валидация и метамодельный редактор исключены из MVP

- `Status`: Accepted for MVP
- `Decision`: edges остаются только направленными связями без типов; модель не валидируется формально; notation editor отсутствует.
- `Impact on roadmap/issues`:
  - M2 и M4 строятся вокруг нод, frame, links и type-color mapping;
  - нельзя заранее вводить generic rule engine или edge type system.
- `Related docs`: 02, 05, 12

### DB-10. Политика конфликтов: last-write-wins

- `Status`: Accepted for MVP
- `Decision`: одновременное редактирование одного файла в VS Code и UI не является целевым сценарием; если конфликт возник, побеждает последнее сохранение.
- `Impact on roadmap/issues`:
  - не создавать issues на наблюдение за внешними изменениями;
  - текст ограничения должен быть отражен в документации или help state.
- `Related docs`: 09

### DB-11. Manifest schema v1

- `Status`: Accepted for MVP
- `Decision`:
  - обязательные поля: `id`, `name`;
  - опциональные: `defaultModel`, `notations`;
  - дополнительные поля в MVP не требуются;
  - пустой bootstrap-проект сериализуется только с `id` и `name`;
  - `defaultModel` отсутствует, пока в проекте нет стартовой модели;
  - `notations` отсутствует или остается пустым, пока не создана первая нотация.
- `Why this is enough`:
  - manifest служит точкой входа, а не registry всех производных состояний;
  - архитектурно важно не перегружать manifest.
- `Operational detail fixed in M1-01`:
  - bootstrap проекта создает только корневую папку, `project.yaml` и `models/`;
  - `notations/` не создается заранее и появляется только при первом notation flow;
  - если первая модель создается в проекте без уже заданного `defaultModel`, manifest получает путь этой модели;
  - последующие create/open/navigation операции не переписывают `defaultModel` автоматически как runtime-state.
- `Impact on roadmap/issues`:
  - M1 issues могут опираться на минимальный manifest;
  - при появлении новых обязательных полей придется пересматривать API и bootstrap.
- `Due stage`: Milestone 1
- `Related docs`: 07, 09, 12

### DB-12. Model schema v1

- `Status`: Accepted provisional
- `Decision`:
  - обязательные поля модели: `id`, `name`, `notation`, `nodes`, `edges`, `frames`;
  - у каждой сущности есть стабильный `id`;
  - `Node.type` может быть `null`;
  - `Node.drilldowns` всегда хранится как массив;
  - `Frame.stepUp` хранится как объект или `null`.
- `Clarification`:
  - empty collections должны сериализоваться явно;
  - schema v1 ориентирована на прозрачность, а не на минимальный объем.
- `Impact on roadmap/issues`:
  - save/open issues не должны откладывать стабилизацию схемы "на потом";
  - canvas slices обязаны использовать одни и те же структуры в памяти и persistence.
- `Due stage`: до начала Milestone 2
- `Related docs`: 07, 09

### DB-13. Notation schema v1

- `Status`: Accepted provisional
- `Decision`:
  - обязательные поля: `id`, `name`, `types`;
  - `recommendedDrilldowns` допускается как необязательный задел на будущее, но не является обязательным MVP behavior.
- `Clarification`:
  - typed-модель в MVP использует нотацию как список доступных типов объектов и цветов;
  - richer meta-rules отсутствуют.
- `Impact on roadmap/issues`:
  - M4 может быть выполнен без notation editor и без полноценной метамодели;
  - если в issues появляется логика сверх type-color catalog, это scope creep.
- `Due stage`: до начала Milestone 4
- `Related docs`: 07, 09

### DB-14. Политика stable IDs и ссылок

- `Status`: Accepted for MVP
- `Decision`:
  - `id` генерируются один раз при создании сущности;
  - rename не меняет `id`;
  - model/file references строятся по относительному пути;
  - object references строятся по `modelPath + objectId`.
- `Consequences`:
  - нельзя строить связи по label или file display name;
  - операции rename не должны ломать внутреннюю идентичность сущностей.
- `Impact on roadmap/issues`:
  - любой issue, затрагивающий creation, rename, save, links, обязан соблюдать эту политику;
  - это базовый dependency для drill-down, step-up и notation linking.
- `Related docs`: 07, 09

### DB-15. Persisted state vs transient UI state

- `Status`: Accepted provisional
- `Decision`:
  - в YAML хранятся доменные данные и координаты объектов на canvas;
  - не хранятся transient UI state: открытость контекстного меню, выделение, состояние боковых панелей, breadcrumbs runtime stack;
  - viewport (`zoom`, `scroll`) в MVP **не является обязательной persisted частью модели**.
- `Rationale`:
  - acceptance criteria требуют сохранения структуры, а не полного UI-сеанса;
  - это удерживает schema v1 от превращения в снимок frontend state.
- `Impact on roadmap/issues`:
  - save/reload issues должны проверять восстановление диаграммы, ссылок, типов и frame, но не обязаны восстанавливать transient UI context;
  - если позже понадобится persisted viewport, это отдельное решение.
- `Due stage`: до начала Milestone 2
- `Related docs`: 08, 12

### DB-16. Навигационная модель между уровнями

- `Status`: Accepted provisional
- `Decision`:
  - есть три механизма входа в модель: project tree, drill-down, step-up;
  - breadcrumbs и back работают как runtime navigation context;
  - project tree остается независимой точкой входа;
  - при переходах между связанными моделями в стек добавляется запись маршрута.
- `Clarification`:
  - breadcrumbs отражают путь навигации пользователя, а не всегда истинную единственную иерархию проекта;
  - одна и та же модель может быть открыта через разные пути.
- `Impact on roadmap/issues`:
  - навигационные issues должны строиться вокруг history/context, а не вокруг единственного parent pointer;
  - tree navigation и semantic navigation следует тестировать отдельно.
- `Due stage`: до начала Milestone 3
- `Related docs`: 04, 05, 06, 08

### DB-17. Семантика синхронизации frame и step-up

- `Status`: Accepted for MVP
- `Decision`:
  - для MVP выбрана semantics `B`: initial generation + explicit manual regeneration/update later, without live sync;
  - первый `step-up` для frame без link создает upper-level model, representative node и сохраняет `frame.stepUp`;
  - `frame.stepUp` становится канонической persistent link для этого frame;
  - повторный обычный `step-up` по already linked frame должен reuse/open existing upper-level target и не должен молча создавать duplicates;
  - обновление upper-level representation допускается только через explicit user action `regenerate/update`;
  - live sync и automatic back-propagation из upper-level model обратно в frame в MVP отсутствуют.
- `Clarifications`:
  - stale representation между manual regenerations в MVP считается допустимым;
  - canonical link опирается на stable ids и relative model path, а не на `Frame.name`;
  - поведение зафиксировано в `M3-01` и обязательно для `M3-02` и `M3-05`.
- `Why this is accepted for MVP`:
  - снижает complex sync risk и не втягивает background reconciliation в critical path;
  - дает понятное UX-правило: create once, open existing by default, refresh only on command;
  - сохраняет путь к richer synchronization later без architectural fork сейчас.
- `Impact on roadmap/issues`:
  - `M3-02` должен доказать practical viability именно для create/open existing/manual regenerate contract;
  - `M3-05` должен имплементировать existing-link reuse по умолчанию и explicit regenerate/update как separate action;
  - issues на live synchronization или automatic bidirectional propagation не входят в MVP.
- `Closed in`: M3-01
- `Related docs`: 05, 07, 09, 10, 12
### DB-18. Правила именования и размещения новых файлов моделей

- `Status`: Accepted for MVP
- `Decision`:
  - `create model`: новая модель создается в выбранном каталоге файлового дерева; если выбрана модель, берется ее родительская папка; если валидный контекст не выбран, используется `models/`;
  - первая модель в пустом проекте, создаваемая без выбранного контекста, получает путь `models/main.yaml`;
  - `drill-down`: новая дочерняя модель создается в той же папке, что и родительская модель;
  - `step-up`: новая верхнеуровневая модель создается в `models/abstractions/`; папка создается по требованию;
  - пути, записываемые в manifest и cross-model links, всегда хранятся относительно корня проекта;
  - file name строится как человекочитаемый slug, а identity обеспечивается полем `id`.
- `Slug rule v1`:
  - базой для slug служит пользовательское имя контекста: имя модели, `Node.label` для drill-down или `Frame.name` для step-up;
  - строка приводится к lowercase, пробелы и `_` заменяются на `-`, недопустимые для v1 символы отбрасываются, последовательности `-` схлопываются;
  - если после нормализации slug пустой, используется fallback-основа: `main`, `model`, `drilldown` или `step-up` по контексту;
  - при конфликте пути добавляется числовой suffix `-2`, `-3` и далее;
  - rename display-name не меняет `id` и не обязан автоматически переименовывать файл в MVP.
- `Why this is accepted for MVP`:
  - правило остается простым для объяснения в UI;
  - create/open/reopen path предсказуем и не зависит от runtime-only state;
  - cross-model links не используют label как identity и выдерживают reopen.
- `Impact on roadmap/issues`:
  - file creation issues и save/reload зависят от этого решения;
  - rename/move issues не должны входить в MVP, пока правило размещения не стабилизировано.
- `Due stage`: внутри Milestone 1
- `Related docs`: 09, 12

### DB-19. Правила извлечения нотации из модели

- `Status`: Accepted provisional
- `Decision`:
  - из текущей модели извлекаются уникальные типы нод;
  - для каждого типа фиксируются `id`, display `name` и `color`;
  - edges, frame semantics и layout в нотацию не переносятся;
  - текущая модель связывается с созданной нотацией.
- `Clarification`:
  - если типы неполные или неаккуратные, качество нотации является следствием качества модели, а не обязанностью системы "догадаться".
- `Impact on roadmap/issues`:
  - M4 issues должны быть сосредоточены на extraction pipeline, а не на rule inference;
  - validation нотации ограничивается структурной корректностью файла.
- `Due stage`: до начала Milestone 4
- `Related docs`: 04, 05, 09, 12

### DB-20. Политика fallback и сообщений об ошибках

- `Status`: Accepted for MVP
- `Decision`:
  - invalid YAML: показать понятное сообщение, не падать, отказать в загрузке модели;
  - broken drill-down / step-up link: показать "Модель не найдена" и предложить создать;
  - missing notation: показать предупреждение и допустить открытие модели как freeform fallback, если это возможно.
- `Impact on roadmap/issues`:
  - hardening milestone должен закрывать не только happy path, но и file-based failure modes;
  - bugfix issues по ошибкам файлов считаются high-priority acceptance work.
- `Related docs`: 06, 09, 11

### DB-21. Стратегия сохранения

- `Status`: Accepted provisional
- `Decision`:
  - ручное сохранение является обязательным MVP path;
  - автосохранение желательно, но не блокирует MVP;
  - если автосохранение добавляется, оно должно быть debounce/background и не вызывать фризов.
- `Impact on roadmap/issues`:
  - slice save/reload должен быть построен вокруг reliable manual save;
  - autosave выносится в optional/stretch issue cluster.
- `Related docs`: 02, 05, 06, 10, 11

### DB-22. Политика multiple drill-down

- `Status`: Accepted provisional
- `Decision`:
  - доменная модель с самого начала допускает несколько drill-down на одну ноду;
  - в roadmap допустима поэтапная реализация: сначала single drill-down UX, затем расширение до списка и выбора.
- `Why this form`:
  - функциональные требования относят multiple drill-down к P0;
  - delivery plan допускает упрощение в случае дефицита ресурсов.
- `Impact on roadmap/issues`:
  - нужно отдельное расширяющее issue внутри Milestone 3;
  - нельзя закладывать архитектуру, которая принципиально поддерживает только одну ссылку.
- `Related docs`: 04, 05, 10

### DB-23. Политика typed-model creation

- `Status`: Accepted provisional
- `Decision`:
  - при создании typed-модели пользователь выбирает существующую нотацию;
  - canvas получает список доступных типов из нотации;
  - при создании ноды применяются type и color из выбранной нотации;
  - строгая бизнес-валидация типов отсутствует.
- `Impact on roadmap/issues`:
  - typed-model slice не должен зависеть от rule engine;
  - UI issue достаточно ограничить picker'ом типов и визуальным применением.
- `Related docs`: 04, 05, 07, 09, 11

### DB-24. Политика принятия результата

- `Status`: Accepted for MVP
- `Decision`:
  - основным критерием приемки является прохождение сквозного демо-сценария;
  - ручная проверка заказчиком имеет приоритет над автоматизированными тестами;
  - отсутствие некоторых P1-полировок не блокирует приемку, если основной поток устойчив.
- `Impact on roadmap/issues`:
  - каждый milestone должен заканчиваться smoke/manual validation issue;
  - roadmap должен строиться так, чтобы полезный демо-поток собирался как можно раньше.
- `Related docs`: 01, 04, 10, 11

---

## Решения, сознательно отложенные за пределы MVP

Эти темы могут иметь свои backlog items в будущем, но **не должны** создавать блокирующие вопросы для MVP roadmap.

| ID | Тема | Статус | Почему отложено |
|---|---|---|---|
| DPM-01 | Typed edges | Deferred post-MVP | Не влияет на проверку ключевой гипотезы |
| DPM-02 | Визуальный редактор нотаций | Deferred post-MVP | Существенно увеличивает scope M4 |
| DPM-03 | Сквозные объекты между моделями | Deferred post-MVP | Сильно усложняет identity и sync |
| DPM-04 | Git integration | Deferred post-MVP | Не нужно для первого цикла валидации гипотезы |
| DPM-05 | Windmill generation | Deferred post-MVP | Это отдельная продуктовая линия развития |
| DPM-06 | Real-time collaboration | Deferred post-MVP | Требует другой архитектуры конфликтов и прав |
| DPM-07 | Rich styling, shapes, iconography | Deferred post-MVP | Не влияет на базовый semantic flow |
| DPM-08 | Автоматическая миграция формата | Deferred post-MVP | Для MVP допустим ручной апдейт формата |

---

## Вывод для roadmap

Для построения дерева последовательных issues пакет решений уже достаточно зрелый.

На текущий момент roadmap можно строить, если в начале backlog явно выделить только два decision points:

1. Уточнение operational detail для `DB-12` / `DB-13` в виде schema-freeze issues без изменения общей архитектуры.

`DB-11` и `DB-18` закрыты в `M1-01`, `DB-17` закрыт в `M3-01`; остальные ключевые направления уже достаточно стабилизированы, чтобы переходить к capability slices и затем к issue decomposition.
