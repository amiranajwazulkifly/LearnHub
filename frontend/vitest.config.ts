import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// Extends the app's Vite config, so tests compile exactly the way the app does.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      // Each file gets a fresh module registry, so Zustand stores start clean.
      isolate: true,
    },
  }),
);
