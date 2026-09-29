-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'ON_DUTY', 'COMPENSATORY_LEAVE', 'UNPAID_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "faculty_leave_requests" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "substitute_faculty_id" UUID,
    "substitute_note" TEXT,
    "substitute_session_ids" UUID[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faculty_leave_requests_institution_id_idx" ON "faculty_leave_requests"("institution_id");

-- CreateIndex
CREATE INDEX "faculty_leave_requests_faculty_id_idx" ON "faculty_leave_requests"("faculty_id");

-- CreateIndex
CREATE INDEX "faculty_leave_requests_institution_id_status_idx" ON "faculty_leave_requests"("institution_id", "status");

-- CreateIndex
CREATE INDEX "faculty_leave_requests_institution_id_start_date_end_date_idx" ON "faculty_leave_requests"("institution_id", "start_date", "end_date");

-- AddForeignKey
ALTER TABLE "faculty_leave_requests" ADD CONSTRAINT "faculty_leave_requests_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_leave_requests" ADD CONSTRAINT "faculty_leave_requests_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_leave_requests" ADD CONSTRAINT "faculty_leave_requests_substitute_faculty_id_fkey" FOREIGN KEY ("substitute_faculty_id") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_leave_requests" ADD CONSTRAINT "faculty_leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
