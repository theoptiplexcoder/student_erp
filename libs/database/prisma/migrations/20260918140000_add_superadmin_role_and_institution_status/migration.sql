-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN "status" "InstitutionStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "institutions" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "institutions" ADD COLUMN "approved_at" TIMESTAMP(3);
ALTER TABLE "institutions" ADD COLUMN "approved_by" UUID;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "institution_id" DROP NOT NULL;
