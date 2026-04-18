/**
 * @atlasrep/config — ESLint base config (todos los proyectos)
 * Requiere: globals
 */
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // Calidad general
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "no-return-await": "error",
    },
  },
];
