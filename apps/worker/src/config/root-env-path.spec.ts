import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { resolveRootEnvPath } from './root-env-path';

describe('resolveRootEnvPath', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'atlaserp-env-worker-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('resuelve el .env de la raiz del monorepo desde una app', () => {
    writeFileSync(join(tempDir, 'pnpm-workspace.yaml'), 'packages: []\n');
    const appDir = join(tempDir, 'apps', 'worker');
    mkdirSync(appDir, { recursive: true });

    expect(resolveRootEnvPath(appDir)).toBe(resolve(tempDir, '.env'));
  });

  it('falla si no encuentra la raiz del monorepo', () => {
    expect(() => resolveRootEnvPath(tempDir)).toThrow('No se encontro pnpm-workspace.yaml');
  });
});
