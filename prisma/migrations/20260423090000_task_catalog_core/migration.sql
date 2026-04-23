-- Task Catalog Core
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'CLOSED', 'ARCHIVED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "TaskSource" AS ENUM ('DOC_MASTER', 'DOC_TASK_FILE', 'DOC_PENDING_REGISTRY', 'CODE_TODO', 'CODE_GAP', 'MANUAL');
CREATE TYPE "TaskCategory" AS ENUM ('API', 'WORKER', 'DATABASE', 'DESKTOP', 'WEB', 'DOCS', 'INFRA', 'OTHER');
CREATE TYPE "TaskDependencyType" AS ENUM ('BLOCKS', 'RELATES');

CREATE TABLE "task_catalog_items" (
  "id" TEXT NOT NULL,
  "taskKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "category" "TaskCategory" NOT NULL DEFAULT 'OTHER',
  "moduleKey" TEXT,
  "featureKey" TEXT,
  "deadlineAt" TIMESTAMP(3),
  "assigneeUserId" TEXT,
  "assigneeRoleId" TEXT,
  "organizationId" TEXT,
  "source" "TaskSource" NOT NULL,
  "sourceRef" TEXT,
  "sourceFingerprint" TEXT,
  "sourceLastSeenAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "task_catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_dependencies" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "dependsOnTaskId" TEXT NOT NULL,
  "type" "TaskDependencyType" NOT NULL DEFAULT 'BLOCKS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_status_history" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "fromStatus" "TaskStatus",
  "toStatus" "TaskStatus" NOT NULL,
  "changedByUserId" TEXT,
  "reason" TEXT,
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "task_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_ingestion_runs" (
  "id" TEXT NOT NULL,
  "source" "TaskSource",
  "status" TEXT NOT NULL,
  "scannedCount" INTEGER NOT NULL DEFAULT 0,
  "upsertedCount" INTEGER NOT NULL DEFAULT 0,
  "archivedCount" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "errors" JSONB,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "organizationId" TEXT,
  "triggeredByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "task_ingestion_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_catalog_items_taskKey_source_key" ON "task_catalog_items"("taskKey", "source");
CREATE INDEX "task_catalog_items_taskKey_idx" ON "task_catalog_items"("taskKey");
CREATE INDEX "task_catalog_items_status_idx" ON "task_catalog_items"("status");
CREATE INDEX "task_catalog_items_priority_idx" ON "task_catalog_items"("priority");
CREATE INDEX "task_catalog_items_category_idx" ON "task_catalog_items"("category");
CREATE INDEX "task_catalog_items_moduleKey_idx" ON "task_catalog_items"("moduleKey");
CREATE INDEX "task_catalog_items_deadlineAt_idx" ON "task_catalog_items"("deadlineAt");
CREATE INDEX "task_catalog_items_assigneeUserId_idx" ON "task_catalog_items"("assigneeUserId");
CREATE INDEX "task_catalog_items_assigneeRoleId_idx" ON "task_catalog_items"("assigneeRoleId");
CREATE INDEX "task_catalog_items_source_idx" ON "task_catalog_items"("source");
CREATE INDEX "task_catalog_items_organizationId_idx" ON "task_catalog_items"("organizationId");

CREATE UNIQUE INDEX "task_dependencies_taskId_dependsOnTaskId_type_key" ON "task_dependencies"("taskId", "dependsOnTaskId", "type");
CREATE INDEX "task_dependencies_taskId_idx" ON "task_dependencies"("taskId");
CREATE INDEX "task_dependencies_dependsOnTaskId_idx" ON "task_dependencies"("dependsOnTaskId");
CREATE INDEX "task_dependencies_type_idx" ON "task_dependencies"("type");

CREATE INDEX "task_status_history_taskId_createdAt_idx" ON "task_status_history"("taskId", "createdAt");
CREATE INDEX "task_status_history_changedByUserId_idx" ON "task_status_history"("changedByUserId");
CREATE INDEX "task_status_history_organizationId_idx" ON "task_status_history"("organizationId");
CREATE INDEX "task_status_history_toStatus_idx" ON "task_status_history"("toStatus");

CREATE INDEX "task_ingestion_runs_startedAt_idx" ON "task_ingestion_runs"("startedAt");
CREATE INDEX "task_ingestion_runs_source_startedAt_idx" ON "task_ingestion_runs"("source", "startedAt");
CREATE INDEX "task_ingestion_runs_status_startedAt_idx" ON "task_ingestion_runs"("status", "startedAt");
CREATE INDEX "task_ingestion_runs_organizationId_idx" ON "task_ingestion_runs"("organizationId");
CREATE INDEX "task_ingestion_runs_triggeredByUserId_idx" ON "task_ingestion_runs"("triggeredByUserId");

ALTER TABLE "task_catalog_items"
  ADD CONSTRAINT "task_catalog_items_assigneeUserId_fkey"
  FOREIGN KEY ("assigneeUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_catalog_items"
  ADD CONSTRAINT "task_catalog_items_assigneeRoleId_fkey"
  FOREIGN KEY ("assigneeRoleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_catalog_items"
  ADD CONSTRAINT "task_catalog_items_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_dependencies"
  ADD CONSTRAINT "task_dependencies_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task_catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_dependencies"
  ADD CONSTRAINT "task_dependencies_dependsOnTaskId_fkey"
  FOREIGN KEY ("dependsOnTaskId") REFERENCES "task_catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_status_history"
  ADD CONSTRAINT "task_status_history_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task_catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_status_history"
  ADD CONSTRAINT "task_status_history_changedByUserId_fkey"
  FOREIGN KEY ("changedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_status_history"
  ADD CONSTRAINT "task_status_history_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_ingestion_runs"
  ADD CONSTRAINT "task_ingestion_runs_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_ingestion_runs"
  ADD CONSTRAINT "task_ingestion_runs_triggeredByUserId_fkey"
  FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

