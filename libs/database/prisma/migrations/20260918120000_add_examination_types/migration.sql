-- AlterTable
ALTER TABLE "exams" ADD COLUMN "examination_type_id" UUID;

-- CreateTable
CREATE TABLE "examination_types" (
    "id" UUID NOT NULL,
    "institution_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "total_marks" DOUBLE PRECISION NOT NULL,
    "passing_marks" DOUBLE PRECISION,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examination_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examination_types_institution_id_idx" ON "examination_types"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_types_institution_id_name_key" ON "examination_types"("institution_id", "name");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_examination_type_id_fkey" FOREIGN KEY ("examination_type_id") REFERENCES "examination_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_types" ADD CONSTRAINT "examination_types_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
