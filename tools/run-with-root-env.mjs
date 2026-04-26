#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const toolsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(toolsDir, '..');
const envPath = resolve(repoRoot, '.env');

function parseEnvFile(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const rootEnv = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, 'utf8')) : {};
const childEnv = { ...rootEnv, ...process.env };
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('[AtlasERP] Uso: node tools/run-with-root-env.mjs <comando> [...args]');
  process.exit(1);
}

if (!existsSync(envPath) && !process.env.DATABASE_URL) {
  console.error('[AtlasERP] No se encontro .env en la raiz. Copia .env.example a .env.');
  process.exit(1);
}

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: childEnv,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
