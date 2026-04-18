/**
 * ESLint config — @atlasrep/desktop (Tauri frontend — JS/JSX)
 */
import react from "@atlasrep/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**", "src-tauri/**"] },
  ...react,
];
