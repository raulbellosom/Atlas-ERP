/**
 * Bridge de caché local SQLite para el módulo FinOps.
 *
 * Provee acceso CRUD a las tablas de caché:
 *   finops_bank_accounts_cache
 *   finops_movements_cache
 *   finops_transfers_cache
 *   finops_cxc_cache
 *   finops_cxp_cache
 *   finops_balance_summary_cache
 *
 * Referencia: docs/02-architecture/15-offline-contract-finops.md
 * Task origen: T-1502 (Fase 15 Bloque 1)
 */

import { sqliteExecute, sqliteQuery } from "./sqlite.bridge.js";

// ---------------------------------------------------------------------------
// Bank Accounts
// ---------------------------------------------------------------------------

export async function finopsBankAccountsCacheUpsert(accounts) {
  for (const a of accounts) {
    await sqliteExecute(
      `INSERT INTO finops_bank_accounts_cache
         (id, organization_id, name, account_number, balance, currency, type, is_active, synced_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(id) DO UPDATE SET
         organization_id = excluded.organization_id,
         name            = excluded.name,
         account_number  = excluded.account_number,
         balance         = excluded.balance,
         currency        = excluded.currency,
         type            = excluded.type,
         is_active       = excluded.is_active,
         synced_at       = excluded.synced_at`,
      [
        a.id,
        a.organizationId,
        a.name,
        a.accountNumber ?? null,
        a.balance ?? 0,
        a.currency ?? "MXN",
        a.type ?? null,
        a.isActive ? 1 : 0,
        a.syncedAt,
      ],
    );
  }
}

export async function finopsBankAccountsCacheList(organizationId) {
  return sqliteQuery(
    `SELECT id, organization_id AS organizationId, name, account_number AS accountNumber,
            balance, currency, type, is_active AS isActive, synced_at AS syncedAt
       FROM finops_bank_accounts_cache
      WHERE organization_id = ?1
      ORDER BY name ASC`,
    [organizationId],
  );
}

export async function finopsBankAccountsCacheClear(organizationId) {
  return sqliteExecute(
    `DELETE FROM finops_bank_accounts_cache WHERE organization_id = ?1`,
    [organizationId],
  );
}

// ---------------------------------------------------------------------------
// Financial Movements
// ---------------------------------------------------------------------------

export async function finopsMovementsCacheUpsert(movements) {
  for (const m of movements) {
    await sqliteExecute(
      `INSERT INTO finops_movements_cache
         (id, bank_account_id, amount, currency, type, status, movement_date, description, synced_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(id) DO UPDATE SET
         bank_account_id = excluded.bank_account_id,
         amount          = excluded.amount,
         currency        = excluded.currency,
         type            = excluded.type,
         status          = excluded.status,
         movement_date   = excluded.movement_date,
         description     = excluded.description,
         synced_at       = excluded.synced_at`,
      [
        m.id,
        m.bankAccountId,
        m.amount,
        m.currency ?? "MXN",
        m.type ?? null,
        m.status ?? null,
        m.movementDate ?? null,
        m.description ?? null,
        m.syncedAt,
      ],
    );
  }
}

export async function finopsMovementsCacheList(bankAccountId, { limit = 500 } = {}) {
  return sqliteQuery(
    `SELECT id, bank_account_id AS bankAccountId, amount, currency, type, status,
            movement_date AS movementDate, description, synced_at AS syncedAt
       FROM finops_movements_cache
      WHERE bank_account_id = ?1
      ORDER BY movement_date DESC, id DESC
      LIMIT ?2`,
    [bankAccountId, limit],
  );
}

export async function finopsMovementsCacheClear(bankAccountId) {
  return sqliteExecute(
    `DELETE FROM finops_movements_cache WHERE bank_account_id = ?1`,
    [bankAccountId],
  );
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------

export async function finopsTransfersCacheUpsert(transfers) {
  for (const t of transfers) {
    await sqliteExecute(
      `INSERT INTO finops_transfers_cache
         (id, from_account_id, to_account_id, amount, currency, status, transfer_date, synced_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(id) DO UPDATE SET
         from_account_id = excluded.from_account_id,
         to_account_id   = excluded.to_account_id,
         amount          = excluded.amount,
         currency        = excluded.currency,
         status          = excluded.status,
         transfer_date   = excluded.transfer_date,
         synced_at       = excluded.synced_at`,
      [
        t.id,
        t.fromAccountId,
        t.toAccountId,
        t.amount,
        t.currency ?? "MXN",
        t.status ?? null,
        t.transferDate ?? null,
        t.syncedAt,
      ],
    );
  }
}

export async function finopsTransfersCacheList({ limit = 200 } = {}) {
  return sqliteQuery(
    `SELECT id, from_account_id AS fromAccountId, to_account_id AS toAccountId,
            amount, currency, status, transfer_date AS transferDate, synced_at AS syncedAt
       FROM finops_transfers_cache
      ORDER BY transfer_date DESC, id DESC
      LIMIT ?1`,
    [limit],
  );
}

export async function finopsTransfersCacheClear() {
  return sqliteExecute(`DELETE FROM finops_transfers_cache`, []);
}

// ---------------------------------------------------------------------------
// Receivables (CxC)
// ---------------------------------------------------------------------------

export async function finopsCxcCacheUpsert(items) {
  for (const c of items) {
    await sqliteExecute(
      `INSERT INTO finops_cxc_cache
         (id, organization_id, counterparty, amount, currency, due_date, status, synced_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(id) DO UPDATE SET
         organization_id = excluded.organization_id,
         counterparty    = excluded.counterparty,
         amount          = excluded.amount,
         currency        = excluded.currency,
         due_date        = excluded.due_date,
         status          = excluded.status,
         synced_at       = excluded.synced_at`,
      [
        c.id,
        c.organizationId,
        c.counterparty ?? null,
        c.amount,
        c.currency ?? "MXN",
        c.dueDate ?? null,
        c.status ?? null,
        c.syncedAt,
      ],
    );
  }
}

export async function finopsCxcCacheList(organizationId, { limit = 200 } = {}) {
  return sqliteQuery(
    `SELECT id, organization_id AS organizationId, counterparty, amount, currency,
            due_date AS dueDate, status, synced_at AS syncedAt
       FROM finops_cxc_cache
      WHERE organization_id = ?1
      ORDER BY due_date ASC, id ASC
      LIMIT ?2`,
    [organizationId, limit],
  );
}

export async function finopsCxcCacheClear(organizationId) {
  return sqliteExecute(
    `DELETE FROM finops_cxc_cache WHERE organization_id = ?1`,
    [organizationId],
  );
}

// ---------------------------------------------------------------------------
// Payables (CxP)
// ---------------------------------------------------------------------------

export async function finopsCxpCacheUpsert(items) {
  for (const c of items) {
    await sqliteExecute(
      `INSERT INTO finops_cxp_cache
         (id, organization_id, counterparty, amount, currency, due_date, status, synced_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(id) DO UPDATE SET
         organization_id = excluded.organization_id,
         counterparty    = excluded.counterparty,
         amount          = excluded.amount,
         currency        = excluded.currency,
         due_date        = excluded.due_date,
         status          = excluded.status,
         synced_at       = excluded.synced_at`,
      [
        c.id,
        c.organizationId,
        c.counterparty ?? null,
        c.amount,
        c.currency ?? "MXN",
        c.dueDate ?? null,
        c.status ?? null,
        c.syncedAt,
      ],
    );
  }
}

export async function finopsCxpCacheList(organizationId, { limit = 200 } = {}) {
  return sqliteQuery(
    `SELECT id, organization_id AS organizationId, counterparty, amount, currency,
            due_date AS dueDate, status, synced_at AS syncedAt
       FROM finops_cxp_cache
      WHERE organization_id = ?1
      ORDER BY due_date ASC, id ASC
      LIMIT ?2`,
    [organizationId, limit],
  );
}

export async function finopsCxpCacheClear(organizationId) {
  return sqliteExecute(
    `DELETE FROM finops_cxp_cache WHERE organization_id = ?1`,
    [organizationId],
  );
}

// ---------------------------------------------------------------------------
// Balance Summary
// ---------------------------------------------------------------------------

export async function finopsBalanceSummaryCacheUpsert(summary) {
  return sqliteExecute(
    `INSERT INTO finops_balance_summary_cache
       (organization_id, currency, total, active_accounts, cached_at)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(organization_id, currency) DO UPDATE SET
       total           = excluded.total,
       active_accounts = excluded.active_accounts,
       cached_at       = excluded.cached_at`,
    [
      summary.organizationId,
      summary.currency ?? "MXN",
      summary.total ?? 0,
      summary.activeAccounts ?? 0,
      summary.cachedAt,
    ],
  );
}

export async function finopsBalanceSummaryCacheGet(organizationId, currency = "MXN") {
  const rows = await sqliteQuery(
    `SELECT organization_id AS organizationId, currency, total, active_accounts AS activeAccounts, cached_at AS cachedAt
       FROM finops_balance_summary_cache
      WHERE organization_id = ?1 AND currency = ?2
      LIMIT 1`,
    [organizationId, currency],
  );
  return rows[0] ?? null;
}

export async function finopsBalanceSummaryCacheClear(organizationId) {
  return sqliteExecute(
    `DELETE FROM finops_balance_summary_cache WHERE organization_id = ?1`,
    [organizationId],
  );
}
