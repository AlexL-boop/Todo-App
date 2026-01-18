import { expect, Locator, Page } from "@playwright/test";

export class TodoPage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url = "http://localhost:4200/") {
    this.page = page;
    this.url = url;
  }

  // -------------------------
  // Core locators (from DOM)
  // -------------------------

  /** Input: placeholder="What needs to be done?" + class="task-input" */
  input(): Locator {
    // placeholder is the most stable and human-meaningful here
    return this.page.getByPlaceholder("What needs to be done?").or(
      this.page.locator('input.task-input[type="text"]')
    );
  }

  /** Add button: class="add-button" and text "Add" */
  addButton(): Locator {
    return this.page
      .locator("button.add-button")
      .or(this.page.getByRole("button", { name: /^add$/i }));
  }

  /** Filters container */
  filters(): Locator {
    return this.page.locator(".filters");
  }

  /** Filter button by name: All / Active / Completed */
  filterButton(name: "All" | "Active" | "Completed"): Locator {
    // In DOM: <div class="filters"><button class="active"> All </button>...
    return this.page
      .locator(".filters button")
      .filter({ hasText: new RegExp(`^\\s*${name}\\s*$`, "i") })
      .first()
      .or(this.page.getByRole("button", { name: new RegExp(`^${name}$`, "i") }));
  }

  /** Task list */
  list(): Locator {
    return this.page.locator(".task-list");
  }

  /** All task items */
  items(): Locator {
    return this.page.locator(".task-item");
  }

  /** Task title span */
  titles(): Locator {
    return this.page.locator(".task-title");
  }

  /**
   * Task item by exact text inside .task-title
   * In DOM: .task-item -> .task-title
   */
  itemByText(text: string): Locator {
    const title = this.page.locator(".task-title", { hasText: text });
    return this.page.locator(".task-item", { has: title }).first();
  }

  /** Checkbox inside конкретного item */
  toggleByText(text: string): Locator {
    return this.itemByText(text)
      .locator('input.task-checkbox[type="checkbox"]')
      .first()
      .or(this.itemByText(text).getByRole("checkbox").first());
  }

  /** Delete button inside item */
  deleteByText(text: string): Locator {
    return this.itemByText(text)
      .locator("button.delete-button")
      .first()
      .or(this.itemByText(text).getByRole("button", { name: /^delete$/i }).first());
  }

  /** Edit button inside item */
  editByText(text: string): Locator {
    return this.itemByText(text)
      .locator("button.edit-button")
      .first()
      .or(this.itemByText(text).getByRole("button", { name: /^edit$/i }).first());
  }

  /** Edit input inside item (edit mode) */
  editInputByText(text: string): Locator {
    return this.itemByText(text).locator("input.edit-input").first();
  }

  /** Save button inside item (edit mode) */
  saveByText(text: string): Locator {
    return this.itemByText(text)
      .locator("button.save-button")
      .first()
      .or(this.itemByText(text).getByRole("button", { name: /^save$/i }).first());
  }

  /** DevServer overlay iframe (webpack dev server client overlay) */
  devServerOverlay(): Locator {
    return this.page.locator("#webpack-dev-server-client-overlay");
  }

  // -------------------------
  // Actions / helpers
  // -------------------------

  async open(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: "domcontentloaded" });
    await this.disableDevServerOverlayIfAny();
    await expect(this.input()).toBeVisible();
  }

  async refresh(): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await this.disableDevServerOverlayIfAny();
    await expect(this.input()).toBeVisible();
  }

  /**
   * Причина твоих таймаутов в прошлом логе — iframe overlay перехватывал клики.
   * Здесь мы безопасно убираем/обезвреживаем его (если он есть).
   */
  async disableDevServerOverlayIfAny(): Promise<void> {
    const overlay = this.devServerOverlay();
    // Бывает, что его нет в prod/статической сборке
    if ((await overlay.count()) === 0) return;

    // Если он есть — выключаем pointer-events + скрываем
    try {
      await overlay.evaluate((el) => {
        (el as HTMLElement).style.pointerEvents = "none";
        (el as HTMLElement).style.display = "none";
        (el as HTMLElement).style.visibility = "hidden";
      });
      // На всякий случай подождем, что он реально не будет мешать
      await overlay.waitFor({ state: "hidden", timeout: 1500 }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /** Универсальный click с подстраховкой от overlay / "intercepts pointer events" */
  private async safeClick(locator: Locator): Promise<void> {
    try {
      await locator.click({ timeout: 5000 });
    } catch (e: any) {
      // Если перехват клика — попробуем прибить overlay и повторить
      await this.disableDevServerOverlayIfAny();
      await locator.click({ timeout: 5000, force: true });
    }
  }

  async addTodo(text: string): Promise<void> {
    await expect(this.input()).toBeVisible();
    await this.input().fill(text);

    // Попробуем Enter (иногда todo-app так добавляет), если не сработает — клик.
    await this.input().press("Enter").catch(() => {});
    // Подождем чуть-чуть: если элемент не появился — жмём Add
    const created = this.itemByText(text);
    if ((await created.count()) === 0) {
      await this.safeClick(this.addButton());
    }

    // Дожидаемся появления — это снижает флейк и ускоряет следующие шаги
    await expect(this.itemByText(text)).toBeVisible({ timeout: 10000 });
  }

  async toggleTodo(text: string): Promise<void> {
    await expect(this.itemByText(text)).toBeVisible({ timeout: 10000 });
    await this.safeClick(this.toggleByText(text));
  }

  async deleteTodo(text: string): Promise<void> {
    await expect(this.itemByText(text)).toBeVisible({ timeout: 10000 });
    await this.safeClick(this.deleteByText(text));
    await expect(this.itemByText(text)).toHaveCount(0, { timeout: 10000 });
  }

  async startEditTodo(text: string): Promise<void> {
    await expect(this.itemByText(text)).toBeVisible({ timeout: 10000 });
    await this.safeClick(this.editByText(text));
    await expect(this.editInputByText(text)).toBeVisible({ timeout: 10000 });
  }

  async saveEditTodo(oldText: string, newText: string): Promise<void> {
    await this.startEditTodo(oldText);
    await this.editInputByText(oldText).fill(newText);
    await this.safeClick(this.saveByText(oldText));
    await expect(this.itemByText(newText)).toBeVisible({ timeout: 10000 });
  }

  async setFilter(name: "All" | "Active" | "Completed"): Promise<void> {
    const btn = this.filterButton(name);
    await expect(btn).toBeVisible();
    await this.safeClick(btn);
    await expect(btn).toHaveClass(/active/);
  }

  // -------------------------
  // Expectations
  // -------------------------

  async expectTodoVisible(text: string): Promise<void> {
    await expect(this.itemByText(text)).toBeVisible({ timeout: 10000 });
  }

  async expectTodoNotVisible(text: string): Promise<void> {
    await expect(this.itemByText(text)).toHaveCount(0, { timeout: 10000 });
  }

  async expectCompleted(text: string): Promise<void> {
    // In DOM: <span class="task-title completed">...</span>
    const title = this.itemByText(text).locator(".task-title").first();
    await expect(title).toHaveClass(/completed/);
  }

  async expectNotCompleted(text: string): Promise<void> {
    const title = this.itemByText(text).locator(".task-title").first();
    await expect(title).not.toHaveClass(/completed/);
  }

  async expectNoItems(): Promise<void> {
    // ВНИМАНИЕ: в твоем приложении по DOM видно, что список часто предзаполнен.
    // Этот метод корректен только если вы явно очищаете список перед тестом.
    await expect(this.items()).toHaveCount(0);
  }

  async getItemCount(): Promise<number> {
    return await this.items().count();
  }
}
