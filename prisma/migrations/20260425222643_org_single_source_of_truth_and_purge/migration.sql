/*
  Warnings:

  - You are about to drop the column `address` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `commercialName` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the `employee_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_catalog_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_dependencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_ingestion_runs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_status_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee_documents" DROP CONSTRAINT "employee_documents_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "employee_documents" DROP CONSTRAINT "employee_documents_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "task_catalog_items" DROP CONSTRAINT "task_catalog_items_assigneeRoleId_fkey";

-- DropForeignKey
ALTER TABLE "task_catalog_items" DROP CONSTRAINT "task_catalog_items_assigneeUserId_fkey";

-- DropForeignKey
ALTER TABLE "task_catalog_items" DROP CONSTRAINT "task_catalog_items_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "task_dependencies" DROP CONSTRAINT "task_dependencies_dependsOnTaskId_fkey";

-- DropForeignKey
ALTER TABLE "task_dependencies" DROP CONSTRAINT "task_dependencies_taskId_fkey";

-- DropForeignKey
ALTER TABLE "task_ingestion_runs" DROP CONSTRAINT "task_ingestion_runs_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "task_ingestion_runs" DROP CONSTRAINT "task_ingestion_runs_triggeredByUserId_fkey";

-- DropForeignKey
ALTER TABLE "task_status_history" DROP CONSTRAINT "task_status_history_changedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "task_status_history" DROP CONSTRAINT "task_status_history_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "task_status_history" DROP CONSTRAINT "task_status_history_taskId_fkey";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "address",
DROP COLUMN "commercialName",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'MX',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fiscalRegime" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "legalEntityType" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "rfc" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "employee_documents";

-- DropTable
DROP TABLE "task_catalog_items";

-- DropTable
DROP TABLE "task_dependencies";

-- DropTable
DROP TABLE "task_ingestion_runs";

-- DropTable
DROP TABLE "task_status_history";

-- DropEnum
DROP TYPE "TaskCategory";

-- DropEnum
DROP TYPE "TaskDependencyType";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskSource";

-- DropEnum
DROP TYPE "TaskStatus";

-- Remove Settings rows that are now owned by the Organization model
DELETE FROM "settings"
WHERE "key" IN (
  'organization.ui.brand_name',
  'organization.ui.primary_color',
  'organization.ui.logo_data_url',
  'organization.profile.industry',
  'organization.profile.company_size'
);
