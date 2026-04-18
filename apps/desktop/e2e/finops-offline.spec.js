/**
 * E2E: Flujo offline → sync del módulo FinOps en desktop Tauri.
 *
 * Requiere:
 *   - App desktop corriendo en modo dev.
 *   - Backend de test activo.
 *   - playwright con soporte de WebView (wdio-webdriverio o playwright-tauri).
 *
 * Task origen: T-1515 (Fase 15 Bloque 4)
 */

// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("FinOps offline → sync", () => {
  test("crear movimiento offline y sincronizar al reconectar", async ({ page, context }) => {
    await page.goto("/finops/movements");
    await expect(page.getByRole("heading", { name: "Movimientos" })).toBeVisible();

    // Simular desconexión
    await context.setOffline(true);
    await page.reload();

    // Verificar banner offline
    await expect(page.getByText("Sin conexión")).toBeVisible();

    // Crear movimiento offline
    await page.getByRole("button", { name: /nuevo movimiento/i }).click();
    await page.getByLabel("Monto").fill("1500");
    await page.getByLabel("Descripción").fill("Prueba offline E2E");
    await page.getByRole("button", { name: /guardar/i }).click();

    // Movimiento visible con badge PENDING_SYNC
    await expect(page.getByText("Prueba offline E2E")).toBeVisible();
    await expect(page.getByText("Pendiente sync")).toBeVisible();

    // Reconectar
    await context.setOffline(false);

    // Esperar sync automático (máx 15s)
    await expect(page.getByText("Pendiente sync")).not.toBeVisible({ timeout: 15_000 });

    // Badge desapareció — movimiento sincronizado
    await expect(page.getByText("Prueba offline E2E")).toBeVisible();
  });

  test("bloqueos de operaciones en modo offline", async ({ page, context }) => {
    await page.goto("/finops/bank-accounts");
    await context.setOffline(true);
    await page.reload();

    // Botón "Nueva cuenta" debe estar oculto
    await expect(page.getByRole("button", { name: /nueva cuenta/i })).not.toBeVisible();

    // Botones "Editar" y "Eliminar" no visibles
    await expect(page.getByRole("button", { name: /editar/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /eliminar/i })).not.toBeVisible();

    await context.setOffline(false);
  });

  test("reconciliación bloqueada offline", async ({ page, context }) => {
    await page.goto("/finops/reconciliation");
    await context.setOffline(true);
    await page.reload();

    await expect(page.getByText("No disponible sin conexión")).toBeVisible();

    await context.setOffline(false);
  });
});
