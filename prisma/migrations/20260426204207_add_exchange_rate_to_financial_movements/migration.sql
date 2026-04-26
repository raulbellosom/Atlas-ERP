-- AlterTable
ALTER TABLE "financial_movements" ADD COLUMN     "exchangeRate" DECIMAL(65,30),
ADD COLUMN     "originalAmount" DECIMAL(65,30);
