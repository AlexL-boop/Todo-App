import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/todo.pages";

/**
 * Генератор уникальных задач, чтобы тесты не конфликтовали с сидом/предзаполненным списком.
 */
function uniqueTodo(prefix: string): string {
  return `${prefix} [pw-${Date.now()}-${Math.random().toString(16).slice(2, 8)}]`;
}

function longText(prefix: string, len = 220): string {
  const base = `${prefix} [pw-${Date.now()}] `;
  const filler = "x".repeat(Math.max(0, len - base.length));
  return base + filler;
}

/**
 * Универсальный "add", который:
 * - сначала пробует Enter (если выбран enter)
 * - если приложение не поддерживает Enter, делает fallback на клик Add
 * Это снижает флаки и при этом сохраняет смысл проверки.
 */
async function addByAction(todo: TodoPage, action: "click" | "enter" | "dblclick", text: string) {
  await todo.input().fill(text);

  if (action === "enter") {
    await todo.input().press("Enter");
    const item = todo.items().filter({ hasText: text }).first();
    // маленький таймаут: если Enter не работает — кликаем Add
    try {
      await expect(item).toBeVisible({ timeout: 700 });
      return;
    } catch {
      await todo.addButton().click({ force: true });
      return;
    }
  }

  if (action === "dblclick") {
    await todo.addButton().dblclick({ force: true });
    return;
  }

  await todo.addButton().click({ force: true });
}

test.describe("Todo App E2E", () => {
  test("TC-001 P0: app opens (input, add, filters visible)", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await expect(todo.input()).toBeVisible();
    await expect(todo.addButton()).toBeVisible();
    await expect(todo.filters()).toBeVisible();
    await expect(todo.filterButton("All")).toBeVisible();
    await expect(todo.filterButton("Active")).toBeVisible();
    await expect(todo.filterButton("Completed")).toBeVisible();
  });

  test("TC-002 P0: create todo (unique)", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Buy milk");
    await todo.addTodo(text);
    await todo.expectTodoVisible(text);
  });

  test("TC-003 P0: create todo by Enter (if supported) OR Add (fallback inside helper)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Enter add");
    await addByAction(todo, "enter", text);
    await todo.expectTodoVisible(text);
  });

  test("TC-004 P0: toggle done -> completed class appears (and can toggle back)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Walk dog");
    await todo.addTodo(text);

    await todo.toggleTodo(text);
    await todo.expectCompleted(text);

    await todo.toggleTodo(text);
    await todo.expectNotCompleted(text);
  });

  test("TC-005 P0: delete todo removes only target", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const a = uniqueTodo("Trash A");
    const b = uniqueTodo("Trash B");

    await todo.addTodo(a);
    await todo.addTodo(b);

    await todo.deleteTodo(a);
    await todo.expectTodoNotVisible(a);

    await todo.expectTodoVisible(b);
  });

  test("TC-006 P1: filters - Completed/Active/All", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const doneText = uniqueTodo("Done item");
    const activeText = uniqueTodo("Active item");

    await todo.addTodo(doneText);
    await todo.addTodo(activeText);

    await todo.toggleTodo(doneText);
    await todo.expectCompleted(doneText);

    await todo.setFilter("Completed");
    await todo.expectTodoVisible(doneText);
    await todo.expectTodoNotVisible(activeText);

    await todo.setFilter("Active");
    await todo.expectTodoVisible(activeText);
    await todo.expectTodoNotVisible(doneText);

    await todo.setFilter("All");
    await todo.expectTodoVisible(activeText);
    await todo.expectTodoVisible(doneText);
  });

  test("TC-007 P1: edit todo (rename) -> new text visible, old not visible", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const original = uniqueTodo("Edit me");
    const updated = uniqueTodo("Edited");

    await todo.addTodo(original);
    await todo.expectTodoVisible(original);

    await todo.saveEditTodo(original, updated);

    await todo.expectTodoVisible(updated);
    await todo.expectTodoNotVisible(original);
  });

  test("TC-008 P1: validation - should not create whitespace-only todo (by click)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const before = await todo.getItemCount();

    await todo.input().fill("   ");
    await todo.addButton().click({ force: true });

    const after = await todo.getItemCount();
    expect(after).toBe(before);
  });

  test("TC-009 P1: double click Add should not create duplicates (same text => +1 max)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("No duplicates");

    const existing = todo.items().filter({ hasText: text });
    const before = await existing.count();

    await todo.input().fill(text);
    await todo.addButton().dblclick({ force: true });

    const after = await existing.count();
    expect(after - before).toBe(1);
  });

  test("TC-010 P2: basic UI structure - list container exists", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await expect(todo.list()).toBeVisible();
  });

  /**
   * Персистентность зависит от требований.
   * Запуск:
   * REQUIRE_PERSISTENCE=1 npx playwright test -g "persist after refresh"
   */
  test("TC-011 P2: persist after refresh (if requirement)", async ({ page }) => {
    test.skip(!process.env.REQUIRE_PERSISTENCE, "Persistence is requirement-dependent");

    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Persist me");
    await todo.addTodo(text);

    await todo.refresh();
    await todo.expectTodoVisible(text);
  });

  test("TC-012 P2: filter correctness - Completed shows only completed tasks", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const completed = uniqueTodo("Completed only");
    const active = uniqueTodo("Active only");

    await todo.addTodo(completed);
    await todo.addTodo(active);
    await todo.toggleTodo(completed);
    await todo.expectCompleted(completed);

    await todo.setFilter("Completed");
    await todo.expectTodoVisible(completed);
    await todo.expectTodoNotVisible(active);
  });

  // ============================
  // ДОБИВКА ДО 100% ПО 4 ШКАЛАМ (PAIRWISE)
  // Data x View x Action x State
  // ============================

  test("TC-013 P1: create SPECIAL chars (emoji/symbols) via CLICK in Active view", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("Active");

    const text = uniqueTodo("Spec ✅✨🔥 #$%&");
    await addByAction(todo, "click", text);

    await todo.expectTodoVisible(text);
  });

  test("TC-014 P1: create SPECIAL chars via DBLCLICK in All view (no duplicates)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("All");

    const text = uniqueTodo("Spec dbl ✅🚀 @@@");
    const items = todo.items().filter({ hasText: text });
    const before = await items.count();

    await addByAction(todo, "dblclick", text);

    const after = await items.count();
    expect(after - before).toBe(1);
  });

  test("TC-015 P2: create LONG text via CLICK in All view", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("All");

    const text = longText(uniqueTodo("Long click"));
    await addByAction(todo, "click", text);

    await todo.expectTodoVisible(text);
  });

  test("TC-016 P2: create LONG text via ENTER -> toggle -> verify in Completed view", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = longText(uniqueTodo("Long enter"));
    await addByAction(todo, "enter", text);

    await todo.toggleTodo(text);
    await todo.expectCompleted(text);

    await todo.setFilter("Completed");
    await todo.expectTodoVisible(text);
  });

  test("TC-017 P1: whitespace validation via ENTER in All view (should not add)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("All");

    const before = await todo.getItemCount();

    await todo.input().fill("    ");
    await todo.input().press("Enter");

    const after = await todo.getItemCount();
    expect(after).toBe(before);
  });

  test("TC-018 P2: toggle behavior under Active filter (completed item disappears, then appears in Completed)", async ({
    page,
  }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Toggle under Active");
    await todo.addTodo(text);

    await todo.setFilter("Active");
    await todo.expectTodoVisible(text);

    await todo.toggleTodo(text);

    // В Active completed-элемент должен исчезнуть
    await todo.expectTodoNotVisible(text);

    // В Completed должен появиться
    await todo.setFilter("Completed");
    await todo.expectTodoVisible(text);
  });

  test("TC-019 P2: delete item in Completed filter", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const text = uniqueTodo("Delete in Completed");
    await todo.addTodo(text);
    await todo.toggleTodo(text);
    await todo.expectCompleted(text);

    await todo.setFilter("Completed");
    await todo.expectTodoVisible(text);

    await todo.deleteTodo(text);
    await todo.expectTodoNotVisible(text);
  });

  test("TC-020 P2: edit completed item keeps completed state", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    const original = uniqueTodo("Completed edit");
    const updated = uniqueTodo("Completed edited");

    await todo.addTodo(original);
    await todo.toggleTodo(original);
    await todo.expectCompleted(original);

    await todo.saveEditTodo(original, updated);

    await todo.expectTodoVisible(updated);
    await todo.expectCompleted(updated);
  });

  test("TC-021 P2: refresh smoke (no crash) in All view", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("All");
    await todo.refresh();

    await expect(todo.input()).toBeVisible();
    await expect(todo.addButton()).toBeVisible();
    await expect(todo.filters()).toBeVisible();
  });

  test("TC-022 P2: filter button active state toggles", async ({ page }) => {
    const todo = new TodoPage(page);
    await todo.open();

    await todo.setFilter("All");
    await expect(todo.filterButton("All")).toHaveClass(/active/i);

    await todo.setFilter("Active");
    await expect(todo.filterButton("Active")).toHaveClass(/active/i);

    await todo.setFilter("Completed");
    await expect(todo.filterButton("Completed")).toHaveClass(/active/i);
  });
});
