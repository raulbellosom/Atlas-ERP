-- AlterTable
ALTER TABLE "employees" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");
