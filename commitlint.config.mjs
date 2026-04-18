/**
 * Commitlint config — AtlasERP
 * Valida mensajes de commit segun Conventional Commits.
 * Canon: docs/07-dev-workflow/06-politica-commits-convenciones.md
 *
 * Tipos validos (segun politica AtlasERP):
 *   feat, fix, docs, style, refactor, test, chore, build, ci, perf, revert
 */

/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "build", "ci", "perf", "revert"],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 120],
  },
};
