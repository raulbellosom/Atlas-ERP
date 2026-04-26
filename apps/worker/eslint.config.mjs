/**
 * ESLint config â€” @atlaserp/worker (NestJS + TypeScript)
 */
import nest from "@atlaserp/config/eslint/nest";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...nest,
];

