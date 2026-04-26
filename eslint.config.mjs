/**
 * ESLint config raÃ­z del monorepo AtlasERP
 * Solo aplica a archivos de tooling en la raÃ­z (scripts, configs, etc.)
 * Cada app/package define su propio eslint.config.mjs extendiendo @atlaserp/config.
 */
import base from "@atlaserp/config/eslint/base";

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

