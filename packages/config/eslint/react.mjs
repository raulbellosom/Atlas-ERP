/**
 * @atlaserp/config â€” ESLint React config (apps/web â€” JS + JSX)
 * Requiere: eslint-plugin-react eslint-plugin-react-hooks globals
 */
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import base from "./base.mjs";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React core
      "react/prop-types": "off", // JS sin PropTypes es aceptable en este stack
      "react/react-in-jsx-scope": "off", // React 17+ no requiere import
      "react/jsx-uses-react": "off", // React 17+ no requiere import en scope
      "react/jsx-uses-vars": "error", // Marcar imports de JSX como usados
      "react/jsx-no-target-blank": "error",
      "react/no-unescaped-entities": "error",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

