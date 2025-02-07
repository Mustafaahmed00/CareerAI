-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "areasForImprovement" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "communicationScore" DOUBLE PRECISION,
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "technicalScore" DOUBLE PRECISION;
