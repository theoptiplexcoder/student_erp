-- CreateIndex
CREATE INDEX "enrollments_institution_id_section_id_status_idx" ON "enrollments"("institution_id", "section_id", "status");

-- CreateIndex
CREATE INDEX "attendance_records_institution_id_status_idx" ON "attendance_records"("institution_id", "status");
