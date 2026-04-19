/**
 * lint-staged config — AtlasERP
 * Ejecutado por el pre-commit hook de Husky.
 * Solo procesa los archivos que estan en staging (git add).
 */

/** @type {import("lint-staged").Config} */
export default {
  // TypeScript y JavaScript: lint + format
  // --no-warn-ignored needed for ESLint v9 flat config in monorepo (files outside root config scope)
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0 --no-warn-ignored", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix --max-warnings=0 --no-warn-ignored", "prettier --write"],

  // JSON, YAML, Markdown: solo format
  "*.{json,jsonc}": ["prettier --write"],
  "*.{yaml,yml}": ["prettier --write"],
  "*.md": ["prettier --write"],

  // CSS / PostCSS (Tailwind)
  "*.css": ["prettier --write"],
};
