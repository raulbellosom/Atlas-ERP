/**
 * ESLint config — @atlasrep/worker (NestJS + TypeScript)
 */
import nest from "@atlasrep/config/eslint/nest";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...nest,
];
