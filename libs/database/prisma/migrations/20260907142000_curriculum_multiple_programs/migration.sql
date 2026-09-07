-- CreateTable
CREATE TABLE IF NOT EXISTS "_CurriculumToProgram" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CurriculumToProgram_AB_pkey" PRIMARY KEY ("A","B")
);

-- Copy existing relations if any exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'curriculums' AND column_name = 'program_id'
  ) THEN
    INSERT INTO "_CurriculumToProgram" ("A", "B")
    SELECT "id", "program_id" FROM "curriculums" WHERE "program_id" IS NOT NULL
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "curriculums" DROP CONSTRAINT IF EXISTS "curriculums_program_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "curriculums_program_id_version_number_key";

-- AlterTable
ALTER TABLE "curriculums" DROP COLUMN IF EXISTS "program_id";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_CurriculumToProgram_B_index" ON "_CurriculumToProgram"("B");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "curriculums_institution_id_name_version_number_key" ON "curriculums"("institution_id", "name", "version_number");

-- AddForeignKey
ALTER TABLE "_CurriculumToProgram" DROP CONSTRAINT IF EXISTS "_CurriculumToProgram_A_fkey";
ALTER TABLE "_CurriculumToProgram" ADD CONSTRAINT "_CurriculumToProgram_A_fkey" FOREIGN KEY ("A") REFERENCES "curriculums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CurriculumToProgram" DROP CONSTRAINT IF EXISTS "_CurriculumToProgram_B_fkey";
ALTER TABLE "_CurriculumToProgram" ADD CONSTRAINT "_CurriculumToProgram_B_fkey" FOREIGN KEY ("B") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
