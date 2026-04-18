/**
 * @atlasrep/config — ESLint NestJS config (apps/api, apps/worker)
 * Extiende typescript.mjs con reglas específicas de NestJS.
 * Requiere: @typescript-eslint/eslint-plugin @typescript-eslint/parser
 */
import typescript from "./typescript.mjs";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...typescript,
  {
    files: ["**/*.ts"],
    rules: {
      // NestJS usa decoradores: no marcar como sin uso
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          // Los parámetros de constructores inyectados son usados por el DI container
          caughtErrors: "all",
        },
      ],
      // En NestJS los métodos async en controladores devuelven Promise implícitamente
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: true },
      ],
    },
  },
];
