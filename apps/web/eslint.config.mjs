/**
 * ESLint config — @atlasrep/web (React + JavaScript)
 */
import react from "@atlasrep/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...react,
];
