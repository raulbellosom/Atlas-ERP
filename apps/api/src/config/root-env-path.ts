import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const WORKSPACE_MARKER = 'pnpm-workspace.yaml';

export function resolveRootEnvPath(startDir = process.cwd()): string {
  let currentDir = resolve(startDir);

  while (true) {
    if (existsSync(resolve(currentDir, WORKSPACE_MARKER))) {
      return resolve(currentDir, '.env');
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(
        `[AtlasERP API] No se encontro ${WORKSPACE_MARKER}; no se puede resolver el .env raiz.`,
      );
    }

    currentDir = parentDir;
  }
}
