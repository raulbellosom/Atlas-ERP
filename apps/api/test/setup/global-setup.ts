import { execFileSync } from 'child_process';
import * as path from 'path';

export default async function globalSetup() {
  const testDbUrl =
    process.env.DATABASE_TEST_URL ??
    process.env.DATABASE_URL ??
    'postgresql://atlaserp:atlaserp_dev@localhost:5432/atlaserp_dev';

  process.env.DATABASE_URL = testDbUrl;

  const schemaPath = path.resolve(__dirname, '../../../../prisma/schema.prisma');
  const prismaCli = path.resolve(__dirname, '../../../../node_modules/prisma/build/index.js');

  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy', '--schema', schemaPath], {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit',
  });
}

