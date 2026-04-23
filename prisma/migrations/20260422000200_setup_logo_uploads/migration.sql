-- CreateTable
CREATE TABLE "setup_uploads" (
    "id" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setup_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "setup_uploads_storagePath_key" ON "setup_uploads"("storagePath");

-- CreateIndex
CREATE INDEX "setup_uploads_expiresAt_idx" ON "setup_uploads"("expiresAt");

-- CreateIndex
CREATE INDEX "setup_uploads_consumedAt_idx" ON "setup_uploads"("consumedAt");
