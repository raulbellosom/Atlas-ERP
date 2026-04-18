-- CreateEnum
CREATE TYPE "FinancialMovementType" AS ENUM ('income', 'expense', 'adjustment', 'transfer_out', 'transfer_in', 'opening_balance');

-- CreateEnum
CREATE TYPE "FinancialMovementStatus" AS ENUM ('draft', 'posted', 'canceled', 'reversed');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('draft', 'posted', 'canceled', 'reversed');

-- CreateEnum
CREATE TYPE "ReconciliationSessionStatus" AS ENUM ('open', 'closed', 'canceled');

-- CreateEnum
CREATE TYPE "ReconciliationItemStatus" AS ENUM ('pending', 'matched', 'discrepancy', 'resolved', 'ignored');

-- CreateEnum
CREATE TYPE "BalanceSnapshotSource" AS ENUM ('manual', 'system', 'reconciliation', 'sync');

-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('customer', 'supplier', 'employee', 'other');

-- CreateEnum
CREATE TYPE "CounterpartyStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('open', 'partially_paid', 'paid', 'overdue', 'canceled', 'written_off');

-- CreateEnum
CREATE TYPE "PayableStatus" AS ENUM ('open', 'partially_paid', 'paid', 'overdue', 'canceled', 'written_off');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentRoleId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "bank_account_types" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "bankAccountTypeId" TEXT,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT,
    "accountNumberMask" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_movements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdById" TEXT,
    "movementType" "FinancialMovementType" NOT NULL,
    "status" "FinancialMovementStatus" NOT NULL DEFAULT 'posted',
    "amount" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "financial_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_movement_attachments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "financialMovementId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "createdById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_movement_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromBankAccountId" TEXT NOT NULL,
    "toBankAccountId" TEXT NOT NULL,
    "branchId" TEXT,
    "outgoingMovementId" TEXT,
    "incomingMovementId" TEXT,
    "initiatedById" TEXT,
    "approvedById" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'posted',
    "amount" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_sessions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "branchId" TEXT,
    "openedById" TEXT,
    "closedById" TEXT,
    "status" "ReconciliationSessionStatus" NOT NULL DEFAULT 'open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reconciliationSessionId" TEXT NOT NULL,
    "financialMovementId" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "ReconciliationItemStatus" NOT NULL DEFAULT 'pending',
    "expectedAmount" DECIMAL(65,30),
    "actualAmount" DECIMAL(65,30),
    "discrepancyAmount" DECIMAL(65,30),
    "reason" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_snapshots" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "branchId" TEXT,
    "capturedById" TEXT,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "source" "BalanceSnapshotSource" NOT NULL DEFAULT 'manual',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counterparties_lite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdById" TEXT,
    "type" "CounterpartyType" NOT NULL DEFAULT 'other',
    "status" "CounterpartyStatus" NOT NULL DEFAULT 'active',
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "counterparties_lite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receivables_lite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "counterpartyId" TEXT,
    "bankAccountId" TEXT,
    "createdById" TEXT,
    "status" "ReceivableStatus" NOT NULL DEFAULT 'open',
    "reference" TEXT,
    "externalReference" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "receivables_lite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payables_lite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT,
    "counterpartyId" TEXT,
    "bankAccountId" TEXT,
    "createdById" TEXT,
    "status" "PayableStatus" NOT NULL DEFAULT 'open',
    "reference" TEXT,
    "externalReference" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currencyCode" TEXT NOT NULL DEFAULT 'MXN',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payables_lite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_account_types_organizationId_isActive_idx" ON "bank_account_types"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "bank_account_types_organizationId_code_key" ON "bank_account_types"("organizationId", "code");

-- CreateIndex
CREATE INDEX "bank_accounts_organizationId_isActive_idx" ON "bank_accounts"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "bank_accounts_branchId_idx" ON "bank_accounts"("branchId");

-- CreateIndex
CREATE INDEX "bank_accounts_bankAccountTypeId_idx" ON "bank_accounts"("bankAccountTypeId");

-- CreateIndex
CREATE INDEX "bank_accounts_createdById_idx" ON "bank_accounts"("createdById");

-- CreateIndex
CREATE INDEX "financial_movements_organizationId_occurredAt_idx" ON "financial_movements"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "financial_movements_bankAccountId_occurredAt_idx" ON "financial_movements"("bankAccountId", "occurredAt");

-- CreateIndex
CREATE INDEX "financial_movements_movementType_status_idx" ON "financial_movements"("movementType", "status");

-- CreateIndex
CREATE INDEX "financial_movements_branchId_idx" ON "financial_movements"("branchId");

-- CreateIndex
CREATE INDEX "financial_movements_createdById_idx" ON "financial_movements"("createdById");

-- CreateIndex
CREATE INDEX "financial_movement_attachments_organizationId_financialMove_idx" ON "financial_movement_attachments"("organizationId", "financialMovementId");

-- CreateIndex
CREATE INDEX "financial_movement_attachments_attachmentId_idx" ON "financial_movement_attachments"("attachmentId");

-- CreateIndex
CREATE INDEX "financial_movement_attachments_createdById_idx" ON "financial_movement_attachments"("createdById");

-- CreateIndex
CREATE INDEX "transfers_organizationId_occurredAt_idx" ON "transfers"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "transfers_fromBankAccountId_occurredAt_idx" ON "transfers"("fromBankAccountId", "occurredAt");

-- CreateIndex
CREATE INDEX "transfers_toBankAccountId_occurredAt_idx" ON "transfers"("toBankAccountId", "occurredAt");

-- CreateIndex
CREATE INDEX "transfers_branchId_idx" ON "transfers"("branchId");

-- CreateIndex
CREATE INDEX "transfers_initiatedById_idx" ON "transfers"("initiatedById");

-- CreateIndex
CREATE INDEX "transfers_approvedById_idx" ON "transfers"("approvedById");

-- CreateIndex
CREATE INDEX "transfers_status_idx" ON "transfers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_outgoingMovementId_key" ON "transfers"("outgoingMovementId");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_incomingMovementId_key" ON "transfers"("incomingMovementId");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_organizationId_startedAt_idx" ON "reconciliation_sessions"("organizationId", "startedAt");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_bankAccountId_startedAt_idx" ON "reconciliation_sessions"("bankAccountId", "startedAt");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_branchId_idx" ON "reconciliation_sessions"("branchId");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_openedById_idx" ON "reconciliation_sessions"("openedById");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_closedById_idx" ON "reconciliation_sessions"("closedById");

-- CreateIndex
CREATE INDEX "reconciliation_sessions_status_idx" ON "reconciliation_sessions"("status");

-- CreateIndex
CREATE INDEX "reconciliation_items_organizationId_status_idx" ON "reconciliation_items"("organizationId", "status");

-- CreateIndex
CREATE INDEX "reconciliation_items_reconciliationSessionId_idx" ON "reconciliation_items"("reconciliationSessionId");

-- CreateIndex
CREATE INDEX "reconciliation_items_financialMovementId_idx" ON "reconciliation_items"("financialMovementId");

-- CreateIndex
CREATE INDEX "reconciliation_items_branchId_idx" ON "reconciliation_items"("branchId");

-- CreateIndex
CREATE INDEX "reconciliation_items_resolvedById_idx" ON "reconciliation_items"("resolvedById");

-- CreateIndex
CREATE INDEX "balance_snapshots_organizationId_snapshotAt_idx" ON "balance_snapshots"("organizationId", "snapshotAt");

-- CreateIndex
CREATE INDEX "balance_snapshots_bankAccountId_snapshotAt_idx" ON "balance_snapshots"("bankAccountId", "snapshotAt");

-- CreateIndex
CREATE INDEX "balance_snapshots_branchId_idx" ON "balance_snapshots"("branchId");

-- CreateIndex
CREATE INDEX "balance_snapshots_capturedById_idx" ON "balance_snapshots"("capturedById");

-- CreateIndex
CREATE INDEX "counterparties_lite_organizationId_status_idx" ON "counterparties_lite"("organizationId", "status");

-- CreateIndex
CREATE INDEX "counterparties_lite_branchId_idx" ON "counterparties_lite"("branchId");

-- CreateIndex
CREATE INDEX "counterparties_lite_createdById_idx" ON "counterparties_lite"("createdById");

-- CreateIndex
CREATE INDEX "counterparties_lite_type_idx" ON "counterparties_lite"("type");

-- CreateIndex
CREATE INDEX "receivables_lite_organizationId_status_dueAt_idx" ON "receivables_lite"("organizationId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "receivables_lite_counterpartyId_status_idx" ON "receivables_lite"("counterpartyId", "status");

-- CreateIndex
CREATE INDEX "receivables_lite_bankAccountId_idx" ON "receivables_lite"("bankAccountId");

-- CreateIndex
CREATE INDEX "receivables_lite_branchId_idx" ON "receivables_lite"("branchId");

-- CreateIndex
CREATE INDEX "receivables_lite_createdById_idx" ON "receivables_lite"("createdById");

-- CreateIndex
CREATE INDEX "payables_lite_organizationId_status_dueAt_idx" ON "payables_lite"("organizationId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "payables_lite_counterpartyId_status_idx" ON "payables_lite"("counterpartyId", "status");

-- CreateIndex
CREATE INDEX "payables_lite_bankAccountId_idx" ON "payables_lite"("bankAccountId");

-- CreateIndex
CREATE INDEX "payables_lite_branchId_idx" ON "payables_lite"("branchId");

-- CreateIndex
CREATE INDEX "payables_lite_createdById_idx" ON "payables_lite"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "roles_parentRoleId_idx" ON "roles"("parentRoleId");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_account_types" ADD CONSTRAINT "bank_account_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_bankAccountTypeId_fkey" FOREIGN KEY ("bankAccountTypeId") REFERENCES "bank_account_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movements" ADD CONSTRAINT "financial_movements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movements" ADD CONSTRAINT "financial_movements_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movements" ADD CONSTRAINT "financial_movements_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movements" ADD CONSTRAINT "financial_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement_attachments" ADD CONSTRAINT "financial_movement_attachments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement_attachments" ADD CONSTRAINT "financial_movement_attachments_financialMovementId_fkey" FOREIGN KEY ("financialMovementId") REFERENCES "financial_movements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement_attachments" ADD CONSTRAINT "financial_movement_attachments_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement_attachments" ADD CONSTRAINT "financial_movement_attachments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromBankAccountId_fkey" FOREIGN KEY ("fromBankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toBankAccountId_fkey" FOREIGN KEY ("toBankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_outgoingMovementId_fkey" FOREIGN KEY ("outgoingMovementId") REFERENCES "financial_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_incomingMovementId_fkey" FOREIGN KEY ("incomingMovementId") REFERENCES "financial_movements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_reconciliationSessionId_fkey" FOREIGN KEY ("reconciliationSessionId") REFERENCES "reconciliation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_financialMovementId_fkey" FOREIGN KEY ("financialMovementId") REFERENCES "financial_movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_capturedById_fkey" FOREIGN KEY ("capturedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties_lite" ADD CONSTRAINT "counterparties_lite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties_lite" ADD CONSTRAINT "counterparties_lite_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counterparties_lite" ADD CONSTRAINT "counterparties_lite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables_lite" ADD CONSTRAINT "receivables_lite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables_lite" ADD CONSTRAINT "receivables_lite_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables_lite" ADD CONSTRAINT "receivables_lite_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "counterparties_lite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables_lite" ADD CONSTRAINT "receivables_lite_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables_lite" ADD CONSTRAINT "receivables_lite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables_lite" ADD CONSTRAINT "payables_lite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables_lite" ADD CONSTRAINT "payables_lite_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables_lite" ADD CONSTRAINT "payables_lite_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "counterparties_lite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables_lite" ADD CONSTRAINT "payables_lite_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables_lite" ADD CONSTRAINT "payables_lite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

