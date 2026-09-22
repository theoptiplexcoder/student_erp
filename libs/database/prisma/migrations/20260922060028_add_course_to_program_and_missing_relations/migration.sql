-- CreateEnum
CREATE TYPE "SessionOccurrenceStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_programId_fkey";

-- DropForeignKey
ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_department_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_institution_id_fkey";

-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "session_occurrence_id" UUID;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN IF EXISTS "programId";

-- AlterTable
ALTER TABLE "programs" ALTER COLUMN "department_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "faculty_sections" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "session_occurrences" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "timetable_entry_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "status" "SessionOccurrenceStatus" NOT NULL DEFAULT 'PLANNED',
    "cancelled_reason" TEXT,
    "rescheduled_to" DATE,
    "attendance_session_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "student_fee_plan_components" (
    "id" UUID NOT NULL,
    "student_fee_plan_id" UUID NOT NULL,
    "fee_component_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "student_fee_plan_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "institution_counters" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "_CourseToProgram" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CourseToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculty_sections_institution_id_idx" ON "faculty_sections"("institution_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculty_sections_faculty_id_idx" ON "faculty_sections"("faculty_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculty_sections_section_id_idx" ON "faculty_sections"("section_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculty_sections_academic_year_id_idx" ON "faculty_sections"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "faculty_sections_faculty_id_section_id_academic_year_id_key" ON "faculty_sections"("faculty_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_occurrences_institution_id_idx" ON "session_occurrences"("institution_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_occurrences_term_id_idx" ON "session_occurrences"("term_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_occurrences_section_id_date_idx" ON "session_occurrences"("section_id", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_occurrences_course_id_date_idx" ON "session_occurrences"("course_id", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "session_occurrences_faculty_id_date_idx" ON "session_occurrences"("faculty_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "session_occurrences_timetable_entry_id_date_key" ON "session_occurrences"("timetable_entry_id", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_fee_plan_components_student_fee_plan_id_idx" ON "student_fee_plan_components"("student_fee_plan_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_fee_plan_components_fee_component_id_idx" ON "student_fee_plan_components"("fee_component_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "institution_counters_institution_id_key_key" ON "institution_counters"("institution_id", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_CourseToProgram_B_index" ON "_CourseToProgram"("B");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "attendance_records_institution_id_student_id_status_idx" ON "attendance_records"("institution_id", "student_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "fee_installments_status_idx" ON "fee_installments"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "grievances_institution_id_status_created_at_idx" ON "grievances"("institution_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_institution_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_department_id_fkey";
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_sections" DROP CONSTRAINT IF EXISTS "faculty_sections_institution_id_fkey";
ALTER TABLE "faculty_sections" ADD CONSTRAINT "faculty_sections_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_sections" DROP CONSTRAINT IF EXISTS "faculty_sections_faculty_id_fkey";
ALTER TABLE "faculty_sections" ADD CONSTRAINT "faculty_sections_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_sections" DROP CONSTRAINT IF EXISTS "faculty_sections_section_id_fkey";
ALTER TABLE "faculty_sections" ADD CONSTRAINT "faculty_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_sections" DROP CONSTRAINT IF EXISTS "faculty_sections_academic_year_id_fkey";
ALTER TABLE "faculty_sections" ADD CONSTRAINT "faculty_sections_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_institution_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_timetable_entry_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_timetable_entry_id_fkey" FOREIGN KEY ("timetable_entry_id") REFERENCES "timetable_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_course_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_section_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_faculty_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_term_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_occurrences" DROP CONSTRAINT IF EXISTS "session_occurrences_attendance_session_id_fkey";
ALTER TABLE "session_occurrences" ADD CONSTRAINT "session_occurrences_attendance_session_id_fkey" FOREIGN KEY ("attendance_session_id") REFERENCES "attendance_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT IF EXISTS "attendance_records_session_occurrence_id_fkey";
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_occurrence_id_fkey" FOREIGN KEY ("session_occurrence_id") REFERENCES "session_occurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_plan_components" DROP CONSTRAINT IF EXISTS "student_fee_plan_components_student_fee_plan_id_fkey";
ALTER TABLE "student_fee_plan_components" ADD CONSTRAINT "student_fee_plan_components_student_fee_plan_id_fkey" FOREIGN KEY ("student_fee_plan_id") REFERENCES "student_fee_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fee_plan_components" DROP CONSTRAINT IF EXISTS "student_fee_plan_components_fee_component_id_fkey";
ALTER TABLE "student_fee_plan_components" ADD CONSTRAINT "student_fee_plan_components_fee_component_id_fkey" FOREIGN KEY ("fee_component_id") REFERENCES "fee_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToProgram" DROP CONSTRAINT IF EXISTS "_CourseToProgram_A_fkey";
ALTER TABLE "_CourseToProgram" ADD CONSTRAINT "_CourseToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToProgram" DROP CONSTRAINT IF EXISTS "_CourseToProgram_B_fkey";
ALTER TABLE "_CourseToProgram" ADD CONSTRAINT "_CourseToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
