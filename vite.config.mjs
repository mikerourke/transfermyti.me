import path from "node:path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const rootDirPath = process.cwd();

const outDirPath = path.resolve(rootDirPath, "out", "build");

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  define: {
    __ENV__: JSON.stringify(command === "build" ? "production" : "development"),
    __USE_LOCAL_API__: JSON.stringify(mode === "mocked"),
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
}));
