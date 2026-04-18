/**
 * lint-staged config — AtlasERP
 * Ejecutado por el pre-commit hook de Husky.
 * Solo procesa los archivos que estan en staging (git add).
 */

/** @type {import("lint-staged").Config} */
export default {
  // TypeScript y JavaScript: lint + format
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{js,jsx}": ["eslint --fix --max-warnings=0", "prettier --write"],

  // JSON, YAML, Markdown: solo format
  "*.{json,jsonc}": ["prettier --write"],
  "*.{yaml,yml}": ["prettier --write"],
  "*.md": ["prettier --write"],

  // CSS / PostCSS (Tailwind)
  "*.css": ["prettier --write"],
};
