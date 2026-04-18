/**
 * ESLint config raíz del monorepo AtlasERP
 * Solo aplica a archivos de tooling en la raíz (scripts, configs, etc.)
 * Cada app/package define su propio eslint.config.mjs extendiendo @atlasrep/config.
 */
import base from "@atlasrep/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "apps/desktop/src-tauri/**",
    ],
  },
  ...base,
];
