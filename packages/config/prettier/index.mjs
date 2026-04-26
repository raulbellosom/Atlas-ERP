/**
 * @atlaserp/config â€” Prettier config compartida
 * Todos los apps y packages extienden esta configuraciÃ³n base.
 */

/** @type {import("prettier").Config} */
const config = {
  // Estilo general
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  printWidth: 100,

  // Espaciado
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  // Finales de lÃ­nea (LF en todos los entornos, incluyendo Windows)
  endOfLine: "lf",

  // Overrides por tipo de archivo
  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      options: { printWidth: 80 },
    },
    {
      files: ["*.md"],
      options: { proseWrap: "always", printWidth: 80 },
    },
    {
      files: ["*.yaml", "*.yml"],
      options: { singleQuote: false },
    },
  ],
};

export default config;

