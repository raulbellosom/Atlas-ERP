/**
 * Pruebas de performance base — FinOps v1
 *
 * Miden el tiempo de respuesta de los endpoints críticos bajo carga normal.
 * Se ejecutan contra el ambiente de staging con datos realistas.
 *
 * Task origen: T-1720 (Fase 17 Bloque 5)
 *
 * Requisitos:
 *   - Backend de staging o local activo
 *   - Token de prueba disponible en PERF_TEST_TOKEN
 *   - DATABASE_URL apuntando a BD con datos del seed T-1708
 */

const API_URL = process.env.PERF_API_URL ?? 'http://localhost:3000';
const AUTH_TOKEN = process.env.PERF_TEST_TOKEN ?? '';

const P95_THRESHOLD_MS = 300;
const WARM_UP_CALLS = 3;
const MEASUREMENT_CALLS = 10;

async function measureEndpoint(
  url: string,
  headers: Record<string, string> = {},
): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < WARM_UP_CALLS + MEASUREMENT_CALLS; i++) {
    const start = performance.now();
    await fetch(url, { headers });
    const elapsed = performance.now() - start;
    if (i >= WARM_UP_CALLS) {
      times.push(elapsed);
    }
  }
  return times;
}

function p95(times: number[]): number {
  const sorted = [...times].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

describe('Performance Baseline — FinOps v1', () => {
  const authHeaders = { Authorization: `Bearer ${AUTH_TOKEN}` };

  if (!AUTH_TOKEN) {
    it.skip('PERF_TEST_TOKEN no configurado — saltando pruebas de performance', () => {});
    return;
  }

  it('GET /v1/bank-accounts → P95 < 300ms', async () => {
    const times = await measureEndpoint(`${API_URL}/v1/bank-accounts`, authHeaders);
    const p95ms = p95(times);
    console.log(`GET /v1/bank-accounts P95: ${p95ms.toFixed(1)}ms`);
    expect(p95ms).toBeLessThan(P95_THRESHOLD_MS);
  }, 60_000);

  it('GET /v1/financial-movements → P95 < 300ms', async () => {
    const times = await measureEndpoint(`${API_URL}/v1/financial-movements`, authHeaders);
    const p95ms = p95(times);
    console.log(`GET /v1/financial-movements P95: ${p95ms.toFixed(1)}ms`);
    expect(p95ms).toBeLessThan(P95_THRESHOLD_MS);
  }, 60_000);

  it('GET /v1/transfers → P95 < 300ms', async () => {
    const times = await measureEndpoint(`${API_URL}/v1/transfers`, authHeaders);
    const p95ms = p95(times);
    console.log(`GET /v1/transfers P95: ${p95ms.toFixed(1)}ms`);
    expect(p95ms).toBeLessThan(P95_THRESHOLD_MS);
  }, 60_000);

  it('GET /v1/receivables-lite → P95 < 300ms', async () => {
    const times = await measureEndpoint(`${API_URL}/v1/receivables-lite`, authHeaders);
    const p95ms = p95(times);
    console.log(`GET /v1/receivables-lite P95: ${p95ms.toFixed(1)}ms`);
    expect(p95ms).toBeLessThan(P95_THRESHOLD_MS);
  }, 60_000);

  it('GET /v1/health → P95 < 50ms', async () => {
    const times = await measureEndpoint(`${API_URL}/v1/health`);
    const p95ms = p95(times);
    console.log(`GET /v1/health P95: ${p95ms.toFixed(1)}ms`);
    expect(p95ms).toBeLessThan(50);
  }, 60_000);
});
