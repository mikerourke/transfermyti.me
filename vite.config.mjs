import path from "node:path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const rootDirPath = process.cwd();

const outDirPath = path.resolve(rootDirPath, "out", "build");

/**
 * @returns {import("vitest").UserConfig}
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ command, mode }) => /** @type {*} */ ({
  define: {
    __ENV__: JSON.stringify(command === "build" ? "production" : "development"),
    __USE_LOCAL_API__: JSON.stringify(mode === "mocked"),
    __LOCAL_API_PORT__: JSON.stringify(9009),
  },
  build: {
    outDir: outDirPath,
    assetsDir: "",
    emptyOutDir: true,
    minify: command === "build",
  },
  plugins: [
    svelte({
      configFile: path.resolve(rootDirPath, "svelte.config.mjs"),
    }),
    tsconfigPaths({ root: rootDirPath }),
  ],
  test: {
    deps: {
      // Temporary workaround to inline the package. clsx is an ES Module,
      // but is shipped in a CommonJS package:
      inline: ["clsx"],
    },
    globals: true,
    environment: "jsdom",
    setupFiles: path.resolve(rootDirPath, "vitestSetup.ts"),
    globalSetup: path.resolve(rootDirPath, "vitestGlobalSetup.mjs"),
    cache: {
      dir: path.resolve(rootDirPath, "node_modules", ".vitest"),
    },
    coverage: {
      provider: "istanbul",
      reporter: ["lcov"],
      reportsDirectory: path.resolve(rootDirPath, "out", "coverage"),
      include: ["src/**"],
      exclude: [
        "**/__fakes__/**",
        "**/__mocks__/**",
        "**/__tests__/**",
        "**/__e2e__/**",
        "**/*.json",
        "**/*.js",
      ],
      // Include _all_ files in coverage, even untested ones:
      all: true,
      // Clean coverage results before running tests:
      clean: true,
    },
  },
}));
