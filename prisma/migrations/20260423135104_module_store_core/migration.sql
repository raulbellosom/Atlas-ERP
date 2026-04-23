-- CreateEnum
CREATE TYPE "ModuleLifecycleState" AS ENUM ('ACTIVE', 'DEPRECATED', 'DISABLED');

-- CreateEnum
CREATE TYPE "ModuleInstallStatus" AS ENUM ('INSTALLED', 'DISABLED', 'UPGRADING', 'ERROR');

-- CreateEnum
CREATE TYPE "ModuleJobOperation" AS ENUM ('INSTALL', 'UNINSTALL', 'UPGRADE');

-- CreateEnum
CREATE TYPE "ModuleJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');

-- AlterTable
ALTER TABLE "task_catalog_items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "task_dependencies" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "task_ingestion_runs" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "module_definitions" (
    "moduleKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "ownerModule" TEXT,
    "lifecycleState" "ModuleLifecycleState" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_definitions_pkey" PRIMARY KEY ("moduleKey")
);

-- CreateTable
CREATE TABLE "module_versions" (
    "id" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "compatibilityRange" TEXT NOT NULL,
    "manifestChecksum" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_dependencies" (
    "id" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "dependsOnModuleKey" TEXT NOT NULL,
    "versionConstraint" TEXT NOT NULL,
    "isHardDependency" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "module_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_module_installations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "ModuleInstallStatus" NOT NULL DEFAULT 'INSTALLED',
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastJobId" TEXT,

    CONSTRAINT "tenant_module_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_install_jobs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "operation" "ModuleJobOperation" NOT NULL,
    "status" "ModuleJobStatus" NOT NULL DEFAULT 'PENDING',
    "requestId" TEXT NOT NULL,
    "traceId" TEXT,
    "logJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_install_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_lifecycle_audit_events" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_lifecycle_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_versions_moduleKey_version_key" ON "module_versions"("moduleKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "module_dependencies_moduleKey_dependsOnModuleKey_key" ON "module_dependencies"("moduleKey", "dependsOnModuleKey");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_module_installations_organizationId_moduleKey_key" ON "tenant_module_installations"("organizationId", "moduleKey");

-- CreateIndex
CREATE UNIQUE INDEX "module_install_jobs_requestId_key" ON "module_install_jobs"("requestId");

-- CreateIndex
CREATE INDEX "module_install_jobs_organizationId_status_idx" ON "module_install_jobs"("organizationId", "status");

-- CreateIndex
CREATE INDEX "module_install_jobs_requestId_idx" ON "module_install_jobs"("requestId");

-- CreateIndex
CREATE INDEX "module_lifecycle_audit_events_organizationId_moduleKey_idx" ON "module_lifecycle_audit_events"("organizationId", "moduleKey");

-- AddForeignKey
ALTER TABLE "module_versions" ADD CONSTRAINT "module_versions_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_dependencies" ADD CONSTRAINT "module_dependencies_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_dependencies" ADD CONSTRAINT "module_dependencies_dependsOnModuleKey_fkey" FOREIGN KEY ("dependsOnModuleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_module_installations" ADD CONSTRAINT "tenant_module_installations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_module_installations" ADD CONSTRAINT "tenant_module_installations_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_install_jobs" ADD CONSTRAINT "module_install_jobs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_install_jobs" ADD CONSTRAINT "module_install_jobs_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_lifecycle_audit_events" ADD CONSTRAINT "module_lifecycle_audit_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_lifecycle_audit_events" ADD CONSTRAINT "module_lifecycle_audit_events_moduleKey_fkey" FOREIGN KEY ("moduleKey") REFERENCES "module_definitions"("moduleKey") ON DELETE RESTRICT ON UPDATE CASCADE;
