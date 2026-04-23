ALTER TABLE "organizations"
  ADD COLUMN "legalName" TEXT,
  ADD COLUMN "commercialName" TEXT,
  ADD COLUMN "primaryColor" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "logoAttachmentId" TEXT;

CREATE INDEX "organizations_logoAttachmentId_idx" ON "organizations"("logoAttachmentId");

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_logoAttachmentId_fkey"
  FOREIGN KEY ("logoAttachmentId") REFERENCES "attachments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "setup_states" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "setup_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "setup_states_key_key" ON "setup_states"("key");
