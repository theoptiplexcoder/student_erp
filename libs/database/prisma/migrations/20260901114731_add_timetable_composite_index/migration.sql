-- CreateEnum
CREATE TYPE "FeeComponentType" AS ENUM ('TUITION', 'TRANSPORT', 'HOSTEL', 'EXAMINATION', 'LIBRARY', 'ADMISSION', 'MISC');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'GATEWAY', 'CHEQUE', 'DEMAND_DRAFT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "WaiverType" AS ENUM ('SCHOLARSHIP', 'FINANCIAL_AID', 'MERIT', 'CONCESSION', 'OTHER');

-- CreateEnum
CREATE TYPE "WaiverStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "student_fee_plans" ADD COLUMN     "fee_structure_id" UUID;

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "program_id" UUID,
    "batch_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_components" (
    "id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeeComponentType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_waivers" (
    "id" UUID NOT NULL,
    "student_fee_plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "waiver_type" "WaiverType" NOT NULL DEFAULT 'SCHOLARSHIP',
    "status" "WaiverStatus" NOT NULL DEFAULT 'APPROVED',
    "reason" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_waivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "PaymentMethod" NOT NULL,
    "transaction_reference" TEXT,
    "gateway_order_id" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_signature" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCESS',
    "notes" TEXT,
    "receipt_number" TEXT,
    "collected_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "installment_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fee_structures_institution_id_idx" ON "fee_structures"("institution_id");

-- CreateIndex
CREATE INDEX "fee_structures_academic_year_id_idx" ON "fee_structures"("academic_year_id");

-- CreateIndex
CREATE INDEX "fee_structures_program_id_idx" ON "fee_structures"("program_id");

-- CreateIndex
CREATE INDEX "fee_structures_batch_id_idx" ON "fee_structures"("batch_id");

-- CreateIndex
CREATE INDEX "fee_components_fee_structure_id_idx" ON "fee_components"("fee_structure_id");

-- CreateIndex
CREATE INDEX "fee_waivers_student_fee_plan_id_idx" ON "fee_waivers"("student_fee_plan_id");

-- CreateIndex
CREATE INDEX "payments_institution_id_idx" ON "payments"("institution_id");

-- CreateIndex
CREATE INDEX "payments_student_id_idx" ON "payments"("student_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_collected_by_id_idx" ON "payments"("collected_by_id");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_id_idx" ON "payment_allocations"("payment_id");

-- CreateIndex
CREATE INDEX "payment_allocations_installment_id_idx" ON "payment_allocations"("installment_id");

-- CreateIndex
CREATE INDEX "student_fee_plans_fee_structure_id_idx" ON "student_fee_plans"("fee_structure_id");

-- CreateIndex
CREATE INDEX "timetable_entries_institution_id_term_id_section_id_idx" ON "timetable_entries"("institution_id", "term_id", "section_id");

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_components" ADD CONSTRAINT "fee_components_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_plans" ADD CONSTRAINT "student_fee_plans_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_waivers" ADD CONSTRAINT "fee_waivers_student_fee_plan_id_fkey" FOREIGN KEY ("student_fee_plan_id") REFERENCES "student_fee_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "fee_installments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
