-- AlterTable
ALTER TABLE "students" ADD COLUMN "usn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_institution_id_usn_key" ON "students"("institution_id", "usn");
