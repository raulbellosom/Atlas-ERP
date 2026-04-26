import base from "../config/eslint/base.mjs";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  ...base,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
