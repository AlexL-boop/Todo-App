
BUG-001

Title: [Chromium/Firefox/WebKit][Todo List] Delete: после удаления todo “Trash B” не находится в списке (item not found)
Env: build: —; URL: —; OS: macOS; browser: Chromium/Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Создать todo A и todo B (Trash A ..., Trash B ...)
Удалить todo A
Проверить, что todo B видим

Expected: Todo B отображается в списке после удаления todo A
Actual: Todo B не найден локатором и ожидание toBeVisible падает (element(s) not found)

Attachments: screenshot/video/trace:
.../TC-005...-Chromium/test-failed-1.png, video.webm, trace.zip
.../TC-005...-Firefox/...
.../TC-005...-WebKit/...
Severity / Priority: Severity: Major (падает критичный сценарий удаления) / Priority: P1
Notes (логи, консоль):

Ошибка: expect(locator).toBeVisible() failed → element(s) not found
Локатор: .task-item + .task-title hasText('Trash B ...')

Место падения: pages/todo.pages.ts:214
Вероятная причина: нестабильный/неуникальный локатор или состояние списка меняется (фильтр/рендер/перерисовка). Может быть и баг приложения (удаление удаляет не тот элемент), но по логу это не доказано.

BUG-002

Title: [Chromium/Firefox/WebKit][Todo List] Edit: при старте редактирования не появляется input редактирования (edit-input not found)
Env: build: —; URL: —; OS: macOS; browser: Chromium/Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Создать todo Edit me [...]
Нажать Edit для этого todo
Ожидать появления поля input.edit-input

Expected: Поле редактирования появляется и доступно для ввода
Actual: input.edit-input не найден, toBeVisible падает (element(s) not found)

Attachments: screenshot/video/trace:
.../TC-007...-Chromium/test-failed-1.png, video.webm, trace.zip
.../TC-007...-Firefox/...
.../TC-007...-WebKit/...
Severity / Priority: Severity: Major / Priority: P1
Notes (логи, консоль):

Ошибка на pages/todo.pages.ts:192
Локатор: .task-item + .task-title hasText('Edit me ...') → .locator('input.edit-input')

Похоже на одно из:
UI реально не переводит item в edit-mode (баг продукта)
локатор editByText/условия входа в edit-mode не соответствуют фактическому DOM (баг автотеста)

BUG-003

Title: [Chromium/Firefox/WebKit][Todo List] Add (DoubleClick): двойной клик Add не добавляет todo (delta=0, ожидали +1)
Env: build: —; URL: —; OS: macOS; browser: Chromium/Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Посчитать количество элементов (before)
Ввести текст todo
Дважды кликнуть по кнопке Add
Посчитать количество элементов (after)

Expected: Добавляется ровно 1 новый todo (after - before = 1)
Actual: after - before = 0 (ничего не добавилось)

Attachments: screenshot/video/trace:
.../TC-009...-Chromium/test-failed-1.png, video.webm, trace.zip
.../TC-009...-Firefox/...
.../TC-009...-WebKit/...
Severity / Priority: Severity: Major / Priority: P1
Notes (логи, консоль):

Ошибка: Expected: 1 Received: 0 на todo.spec.ts:184
Это может быть:
баг продукта: двойной клик приводит к отмене/сбросу/блокировке добавления
или баг автотеста: клик не сработал (например, overlay/перекрытие/disabled кнопка/фокус не в input)

BUG-004

Title: [Chromium/Firefox/WebKit][Todo List] Add Special chars (DoubleClick): двойной клик Add не добавляет todo (delta=0)
Env: build: —; URL: —; OS: macOS; browser: Chromium/Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Посчитать count (before)
Ввести todo со спецсимволами/эмодзи
Дважды нажать Add
Проверить after - before
Expected: after - before = 1
Actual: after - before = 0

Attachments: screenshot/video/trace:
.../TC-014...-Chromium/test-failed-1.png, video.webm, trace.zip
.../TC-014...-Firefox/...
.../TC-014...-WebKit/...
Severity / Priority: Severity: Major / Priority: P1
Notes (логи, консоль):

Ошибка на todo.spec.ts:263
Похоже на тот же класс проблемы, что и BUG-003, только с другим вводом. Можно объединять в один баг, если продукт одинаково не добавляет при dblclick.

BUG-005

Title: [Firefox/WebKit][Todo List] Validation: whitespace-only todo по клику Add добавляется (count увеличивается)
Env: build: —; URL: —; OS: macOS; browser: Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Посчитать count (before)
Ввести " " (пробелы)
Нажать Add
Посчитать count (after)
Expected: Todo не создаётся, count не меняется
Actual: Count увеличился (в логе: Expected: 0 Received: 10, то есть after != before)

Attachments: screenshot/video/trace:
.../TC-008...-Firefox/test-failed-1.png, video.webm, trace.zip
(для WebKit аналогичный путь не указан именно для TC-008, но падения whitespace есть на TC-017; если есть — приложить)
Severity / Priority: Severity: Major (валидатор не работает) / Priority: P1
Notes (логи, консоль):

Ошибка: expect(after).toBe(before) → Expected 0 Received 10
Это выглядит как дефект продукта, если реально создаётся “пустая” задача.
Но число 10 похоже на “count всех элементов в списке”, а не “дельта”, значит возможна ошибка в измерении baseline/окружении (например, тест не стартует с чистого состояния).

BUG-006

Title: [Firefox/WebKit][Todo List] Validation: whitespace-only todo по Enter добавляется (count увеличивается)
Env: build: —; URL: —; OS: macOS; browser: Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Посчитать count (before)
Ввести " "
Нажать Enter
Посчитать count (after)
Expected: Todo не создаётся, count не меняется
Actual: Count изменился (Expected 0 Received 10)

Attachments: screenshot/video/trace:
.../TC-017...-Firefox/test-failed-1.png, video.webm, trace.zip
.../TC-017...-WebKit/test-failed-1.png, video.webm, trace.zip
Severity / Priority: Severity: Major / Priority: P1
Notes (логи, консоль):

Ошибка на todo.spec.ts:308
Аналогично BUG-005: похоже на дефект продукта, но есть риск, что baseline/состояние окружения нестабильно.

BUG-007

Title: [Chromium/Firefox/WebKit][Todo List] Edit completed: у completed item не появляется input редактирования (edit-input not found)
Env: build: —; URL: —; OS: macOS; browser: Chromium/Firefox/WebKit; viewport: —
Steps:
Открыть Todo App
Создать todo Completed edit [...]
Перевести в completed
Нажать Edit
Ожидать input.edit-input
Expected: Поле редактирования появляется и item остаётся completed после сохранения
Actual: input.edit-input не найден → toBeVisible падает

Attachments: screenshot/video/trace:
.../TC-020...-Chromium/test-failed-1.png, video.webm, trace.zip
.../TC-020...-Firefox/...
.../TC-020...-WebKit/...

Severity / Priority: Severity: Major / Priority: P2
Notes (логи, консоль):

Падает в pages/todo.pages.ts:192 (как и BUG-002)
Это может быть ограничение продукта (“completed нельзя редактировать”) — тогда тест неверный, но требование надо уточнить.
