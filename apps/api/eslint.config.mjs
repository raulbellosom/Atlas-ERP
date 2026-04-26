import path from "node:path";
import { fileURLToPath } from "node:url";
import nest from "@atlaserp/config/eslint/nest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...nest,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: [path.join(__dirname, "tsconfig.eslint.json")],
      },
    },
    rules: {
      "no-duplicate-imports": "off",
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];
