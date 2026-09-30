-- CreateTable
CREATE TABLE "faculty_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faculty_id" UUID NOT NULL,
    "custom_role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faculty_roles_faculty_id_idx" ON "faculty_roles"("faculty_id");

-- CreateIndex
CREATE INDEX "faculty_roles_custom_role_id_idx" ON "faculty_roles"("custom_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_roles_faculty_id_custom_role_id_key" ON "faculty_roles"("faculty_id", "custom_role_id");

-- AddForeignKey
ALTER TABLE "faculty_roles" ADD CONSTRAINT "faculty_roles_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_roles" ADD CONSTRAINT "faculty_roles_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
