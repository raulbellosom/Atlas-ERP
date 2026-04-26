/**
 * ESLint config â€” @atlaserp/web (React + JavaScript)
 */
import react from "@atlaserp/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...react,
];

