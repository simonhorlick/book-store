import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    poolOptions: {
      forks: {
        execArgv: ["--stack-size=3000"],
      },
    },
  },
});
