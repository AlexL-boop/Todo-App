- Настройте генерацию отчётов (Allure или аналог)
npx playwright show-report
- Добавьте тестирование API (отдельно от UI)
npx playwright test -g "Todo API"
- Предложите улучшения архитектуры тестового фреймворка
4) Предложения по улучшению тестов
4.1. Улучшить Playwright config
retries: 1 (только на CI)
trace: 'on-first-retry'
video: 'retain-on-failure'
baseURL + page.goto('/') вместо явных URL
Разделить проекты: Chromium/Firefox/WebKit + mobile (если надо)
4.2. Добавить контроль требований как “capability flags”
REQUIRE_PERSIST, NO_DUPLICATES, REQUIRE_TRIM, ALLOW_EMPTY и т.д.
Тогда тест-сьют будет адаптироваться под ТЗ без ручного комментирования.
4.3. Улучшить edge coverage
Trim-поведение: " Task " сохраняется ли с пробелами?
Unicode: "Привет", "中文", комбинированные символы
Очень длинные строки (1000–5000 символов)
Проверка, что edit нельзя сохранить пустым (если есть ограничение)
4.4. Добавить API/Storage assertions (если применимо)
Если хранение идёт в localStorage — проверять ключи
Если есть API — page.waitForResponse() и проверка статуса/пэйлоада
4.5. Улучшить диагностику при падениях
Доп. скрин/лог при add/edit:
вывести count до/после
вывести первые N title элементов (для отладки)

- Напишите инструкцию по запуску тестов для команды разработки
npm install playwright
npx playwright test   
npx playwright show-report
