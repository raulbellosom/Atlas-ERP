/**
 * ESLint config â€” @atlaserp/desktop (Tauri frontend â€” JS/JSX)
 */
import react from "@atlaserp/config/eslint/react";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist/**", "node_modules/**", "src-tauri/**"] },
  ...react,
];

