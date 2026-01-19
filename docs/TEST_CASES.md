Тест-кейсы

TC-001 P0: app opens (input, add, filters visible)

TC-002 P0: create todo (unique)

TC-003 P0: create todo by Enter (if supported) OR Add (fallback inside helper)

TC-004 P0: toggle done -> completed class appears (and can toggle back)

TC-005 P0: delete todo removes only target

TC-006 P1: filters - Completed/Active/All

TC-007 P1: edit todo (rename) -> new text visible, old not visible

TC-008 P1: validation - should not create whitespace-only todo (by click)

TC-009 P1: double click Add should not create duplicates (same text => +1 max)

TC-010 P2: basic UI structure - list container exists

TC-011 P2: persist after refresh (if requirement) (skipped в прогоне)

TC-012 P2: filter correctness - Completed shows only completed tasks

TC-013 P1: create SPECIAL chars (emoji/symbols) via CLICK in Active view

TC-014 P1: create SPECIAL chars via DBLCLICK in All view (no duplicates)

TC-015 P2: create LONG text via CLICK in All view

TC-016 P2: create LONG text via ENTER -> toggle -> verify in Completed view

TC-017 P1: whitespace validation via ENTER in All view (should not add)

TC-018 P2: toggle behavior under Active filter (completed item disappears, then appears in Completed)

TC-019 P2: delete item in Completed filter

TC-020 P2: edit completed item keeps completed state

TC-021 P2: refresh smoke (no crash) in All view

TC-022 P2: filter button active state toggles




Покрытие 
Ниже — развёрнутый отчёт по полноте покрытия функционала (на основе твоих E2E-тестов + DOM-снапшота страницы). Источник UI-элементов: сохранённая страница Todo App.

1) Что считаю “функционалом” (каталог требований)
Я собрал функциональные требования (FR) прямо из DOM/видимых элементов страницы:
Ввод/добавление
FR-01 Страница открывается, есть поле ввода задач (input.task-input, placeholder “What needs to be done?”)
FR-02 Кнопка “Add” доступна (button.add-button)
FR-03 Добавление задачи через кнопку Add
FR-04 Валидация: пустая/пробельная задача не создаётся

Список задач
FR-05 Задачи отображаются списком (div.task-list → div.task-item)
FR-06 У задачи есть чекбокс выполнения (input.task-checkbox)
FR-07 У задачи есть название (span.task-title)
FR-08 Завершённая задача визуально отличается (span.task-title.completed)

Действия
FR-09 У задачи есть кнопка Edit (button.edit-button)
FR-10 У задачи есть кнопка Delete (button.delete-button)
FR-11 Удаление задачи работает

Фильтры
FR-12 Есть фильтры All/Active/Completed (div.filters + три кнопки)
FR-13 Фильтр “All” показывает все
FR-14 Фильтр “Active” показывает только невыполненные
FR-15 Фильтр “Completed” показывает только выполненные

Персистентность (под вопросом)
FR-16 Сохранение после refresh (если это требование, у тебя оно помечено как “if requirement”)

Итого в каталоге: 16 функциональных требований.

3) Что покрывают твои текущие тесты (coverage by design)
Текущие тесты:
TC-001 app opens → покрывает FR-01
TC-002 create todo → покрывает FR-03 (и частично FR-05/FR-07, если правильно проверять отображение)
TC-003 toggle done → покрывает FR-06 + FR-08
TC-004 delete todo → покрывает FR-11
TC-005 persist after refresh → покрывает FR-16
TC-006 validation empty → покрывает FR-04
TC-009 double click duplicates → это неявное требование (в каталоге нет как обязательного, потому что в UI/DOM это никак не видно как правило)

Матрица “требование → тест”
Покрыто тестами (по задумке):
FR-01 ✅ (TC-001)
FR-03 ✅ (TC-002)
FR-04 ✅ (TC-006)
FR-06 ✅ (TC-003)
FR-08 ✅ (TC-003)
FR-11 ✅ (TC-004)
FR-16 ✅ (TC-005)

Не покрыто тестами:
FR-02 (проверка кнопки Add как элемента/состояния)
FR-05 (что список именно отображается корректно)
FR-07 (локатор/проверка текста задачи через реальные элементы span.task-title)
FR-09/FR-10 (наличие кнопок Edit/Delete в строке задачи и сценарии редактирования)
FR-12–FR-15 (фильтры)

5) Отдельно: “покрыто тестами” vs “покрыто фактически (проходит)”
По твоему логу сейчас:
стабильно проходит TC-001 и TC-006
падают create/toggle/delete/persist/duplicates из-за несовпадения локаторов с реальным DOM (у тебя в тестах li/data-testid, а в DOM — div.task-item + span.task-title).
Значит есть 2 метрики:

A) Покрытие по дизайну (есть тест на требование)
[
Coverage_{design} = \frac{N_{requirements_with_tests}}{N_{requirements_total}} \times 100%
]
Где:
(N_{requirements_total}=16)
(N_{requirements_with_tests}=7) (FR-01,03,04,06,08,11,16)
[
Coverage_{design} = \frac{7}{16}\times 100% = 43.75% \approx 44%
]

B) Покрытие по исполнению (тест реально проходит → требование реально “закрыто”)
[
Coverage_{execution} = \frac{N_{requirements_passed}}{N_{requirements_total}} \times 100%
]
Сейчас реально проходят требования:
FR-01 (TC-001)
FR-04 (TC-006)
[
Coverage_{execution} = \frac{2}{16}\times 100% = 12.5% \approx 13%
]

7) Взвешенное покрытие (по приоритету/риску) — как в реальных проектах
Чтобы оценка была ближе к “бизнес-реальности”, я считаю weighted coverage: P0 требования важнее P1/P2.
Шкала весов (пример)
P0 = 5
P1 = 3
P2 = 1

Расклад требований по приоритету (логичный для Todo)
P0 (вес 5): FR-01, FR-03, FR-04, FR-06, FR-11
P1 (вес 3): FR-05, FR-07, FR-08, FR-12–FR-15
P2 (вес 1): FR-02, FR-09, FR-10, FR-16 (потому что “если требование”)

Формула
[
Coverage_{weighted} = \frac{\sum w_i \cdot covered_i}{\sum w_i} \times 100%
]
где (covered_i = 1) если требование покрыто, иначе 0.

4.1 Weighted coverage “по дизайну”
Покрытые по дизайну: FR-01, FR-03, FR-04, FR-06, FR-08, FR-11, FR-16
Сумма весов покрытых:
P0: FR-01(5)+FR-03(5)+FR-04(5)+FR-06(5)+FR-11(5)=25
P1: FR-08(3)=3
P2: FR-16(1)=1
Итого покрыто: 29

Сумма весов всех требований:
P0: 5 требований × 5 = 25
P1: 8 требований × 3 = 24
P2: 3 требования × 1 = 3
Итого: 52
[
Coverage_{weighted,design} = \frac{29}{52}\times 100% = 55.77% \approx 56%
]

4.2 Weighted coverage “по исполнению”
Реально проходят: FR-01 (5), FR-04 (5) → покрыто 10
[
Coverage_{weighted,execution} = \frac{10}{52}\times 100% = 19.23% \approx 19%
]

9) Итоговые цифры (что можно говорить в отчёте)
Functional coverage (design): ~44%
Functional coverage (execution): ~13%
Weighted coverage (design): ~56%
Weighted coverage (execution): ~19%
Почему weighted выше? Потому что ты в первую очередь пытался покрыть P0-цепочку(open/create/toggle/delete/validation).

10) Что именно “не покрыто” (и почему это важно)
Критичные пробелы (P0/P1):
Фильтры All/Active/Completed (FR-12..FR-15) — отдельный функциональный блок UI, сейчас тестов нет.
Edit (FR-09) — в UI есть Edit, но сценария редактирования нет вообще.
Проверки реального DOM списка (FR-05/FR-07) — сейчас тесты ищут li/data-testid, а нужно работать с div.task-item/span.task-title, поэтому даже базовые сценарии “создал → вижу в списке” не валидируются.

11) Что я бы добавил, чтобы довести покрытие до “приличного”
Минимальный план (без усложнений):
E2E фильтров: добавить 3 теста (Active/Completed/All) на основе чекбокса и проверок видимости span.task-title.
E2E редактирования: “Edit → поменять текст → Save → текст обновился”.
E2E создания: подтверждать появление именно по span.task-title (а не li).
Персистентность: оставить как отдельный тест, но пометить как optional или флажком test.skip() пока не подтверждено требование.
