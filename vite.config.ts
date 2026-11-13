import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import { apiPlugin } from "./engine/plugin/api-plugin.ts";
import { usulanPlugin } from "./engine/plugin/usulan-plugin.ts";

// https://vite.dev/config/
export default defineConfig({
  fmt: {},
  lint: {
    // Template berisi placeholder dan baru valid setelah disalin ke tribes/.
    ignorePatterns: ["templates/**"],
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  server: {
    // Bahan, ekspor, dan tinjauan tidak boleh memicu reload.
    watch: { ignored: ["**/sumber/**", "**/export/**", "**/tinjauan.json"] },
  },
  resolve: {
    alias: { "@engine": path.resolve(import.meta.dirname, "engine") },
  },
  plugins: lazyPlugins(() => [
    react(),
    tailwindcss(),
    usulanPlugin({ root: import.meta.dirname, dirs: ["projects", "examples"] }),
    apiPlugin({ root: import.meta.dirname }),
  ]),
});
