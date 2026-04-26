/**
 * @atlaserp/config â€” ESLint TypeScript config
 * Requiere: @typescript-eslint/eslint-plugin @typescript-eslint/parser
 */
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import base from "./base.mjs";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Desactivar reglas JS que TypeScript maneja mejor
      "no-unused-vars": "off",
      "no-return-await": "off",

      // TypeScript estricto (canon: no `any`)
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];

