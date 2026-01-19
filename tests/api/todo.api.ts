import { APIRequestContext, expect } from "@playwright/test";

export class TodoApi {
  constructor(private readonly request: APIRequestContext, private readonly baseURL: string) {}

  async createTodo(text: string) {
    const resp = await this.request.post(`${this.baseURL}/api/todos`, {
      data: { text },
    });
    expect(resp.ok()).toBeTruthy();
    return await resp.json();
  }

  async resetTodos() {
    // если есть endpoint очистки тестовых данных (идеально для автотестов)
    await this.request.post(`${this.baseURL}/api/test/reset`);
  }
}