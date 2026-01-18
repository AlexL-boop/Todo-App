import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [
  ["list"],
  ["html", { outputFolder: "playwright-report", open: "never" }],
  ["junit", { outputFile: "playwright-report/junit.xml" }],
  ["allure-playwright"]
],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4200",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "Chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "WebKit", use: { ...devices["Desktop Safari"] } },
  ],
});
