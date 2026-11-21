import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "Desktop Firefox",
      testMatch: [
        "**/browser-experience.spec.ts",
        "**/home-experience.spec.ts",
        "**/home-profile.spec.ts",
        "**/intimacy-suite.spec.ts",
        "**/advice.spec.ts",
      ],
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Wide Desktop",
      testMatch: [
        "**/browser-experience.spec.ts",
        "**/home-experience.spec.ts",
        "**/home-profile.spec.ts",
        "**/intimacy-suite.spec.ts",
        "**/advice.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: "Desktop Chrome",
      testIgnore: "**/library.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Tablet",
      testIgnore: "**/library.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "Mobile",
      testIgnore: "**/library.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "Catalog Chrome",
      testMatch: "**/library.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "npm run build && npx next start --port 3000 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      BETWEEN_US_UID_SECRET:
        "playwright-only-cookie-signing-secret-32-characters",
      BETWEEN_US_ADMIN_KEY: "between-us-playwright-admin-key",
      ALLOW_HTTP_LOCALHOST: "true",
      BETWEEN_US_DATA_DIR: "test-results/e2e-data",
      ...(process.env.RUN_FIREBASE_E2E === "true"
        ? {
            NEXT_PUBLIC_FIREBASE_API_KEY: "emulator-only-api-key",
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
              "demo-truth-desire.firebaseapp.com",
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-truth-desire",
            NEXT_PUBLIC_FIREBASE_APP_ID: "emulator-only-app-id",
            NEXT_PUBLIC_FIREBASE_USE_EMULATOR: "true",
            FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
            FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
          }
        : {}),
    },
  },
});
