import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { BulkAcademicImportDto } from '../dto/bulk-academic-import.dto';

@Injectable()
export class AcademicBulkImportService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    institutionId: string,
    dto: BulkAcademicImportDto,
  ): Promise<{
    valid: boolean;
    errors: Array<{ entity: string; code: string; message: string }>;
    summary: {
      departments: number;
      courses: number;
      programs: number;
      terms: number;
      sections: number;
    };
  }> {
    const errors: Array<{ entity: string; code: string; message: string }> = [];

    const deptCodes = new Set(dto.departments.map((d) => d.code));
    const courseCodes = new Set(dto.courses.map((c) => c.code));
    const programCodes = new Set(dto.programs.map((p) => p.code));

    // Validate course department references
    for (const course of dto.courses) {
      if (!deptCodes.has(course.departmentCode)) {
        errors.push({
          entity: 'course',
          code: course.code,
          message: `Course "${course.code}" references unknown department code "${course.departmentCode}"`,
        });
      }
    }

    // Validate program department references
    for (const program of dto.programs) {
      if (!deptCodes.has(program.departmentCode)) {
        errors.push({
          entity: 'program',
          code: program.code,
          message: `Program "${program.code}" references unknown department code "${program.departmentCode}"`,
        });
      }
    }

    // Validate curriculum → program references and term → course references
    let totalTerms = 0;
    let totalSections = 0;
    for (const curriculum of dto.curriculums) {
      if (!programCodes.has(curriculum.programCode)) {
        errors.push({
          entity: 'curriculum',
          code: curriculum.programCode,
          message: `Curriculum "${curriculum.curriculumName}" references unknown program code "${curriculum.programCode}"`,
        });
      }
      for (const term of curriculum.terms) {
        totalTerms++;
        for (const tc of term.courses) {
          if (!courseCodes.has(tc.courseCode)) {
            errors.push({
              entity: 'termCourse',
              code: tc.courseCode,
              message: `Term "${term.name}" (seq ${term.sequence}) references unknown course code "${tc.courseCode}"`,
            });
          }
          for (const prereq of tc.prerequisites ?? []) {
            if (!courseCodes.has(prereq)) {
              errors.push({
                entity: 'prerequisite',
                code: prereq,
                message: `Course "${tc.courseCode}" has prerequisite "${prereq}" which is not in the import`,
              });
            }
          }
        }
        totalSections += term.sections.length;
      }
    }

    const summary = {
      departments: deptCodes.size,
      courses: courseCodes.size,
      programs: programCodes.size,
      terms: totalTerms,
      sections: totalSections,
    };

    if (errors.length > 0) {
      return { valid: false, errors, summary };
    }

    return { valid: true, errors: [], summary };
  }

  async ingest(
    institutionId: string,
    dto: BulkAcademicImportDto,
  ): Promise<{
    success: boolean;
    countSummary: {
      departments: number;
      courses: number;
      programs: number;
      terms: number;
      sections: number;
    };
  }> {
    // Pre-validate before touching the DB
    const validation = await this.validate(institutionId, dto);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Validation failed before ingestion',
        errors: validation.errors,
      });
    }

    let totalTerms = 0;
    let totalSections = 0;

    await this.prisma.$transaction(
      async (tx) => {
        // ── Step 1: Upsert departments ──────────────────────────────────────
        // Department has @@unique([institutionId, code]) → use compound key
        const departmentMap = new Map<string, string>();
        for (const d of dto.departments) {
          const dept = await tx.department.upsert({
            where: { institutionId_code: { institutionId, code: d.code } },
            update: { name: d.name },
            create: { institutionId, code: d.code, name: d.name },
          });
          departmentMap.set(d.code, dept.id);
        }

        // ── Step 2: Upsert courses ──────────────────────────────────────────
        // Course has @@unique([institutionId, code]) → use compound key
        const courseMap = new Map<string, string>();
        for (const c of dto.courses) {
          const departmentId = departmentMap.get(c.departmentCode);
          const course = await tx.course.upsert({
            where: { institutionId_code: { institutionId, code: c.code } },
            update: { name: c.title, creditValue: c.credits, departmentId },
            create: {
              institutionId,
              code: c.code,
              name: c.title,
              creditValue: c.credits,
              departmentId,
              ...(c.type ? { courseType: c.type } : {}),
            },
          });
          courseMap.set(c.code, course.id);
        }

        // ── Step 3: Upsert programs ─────────────────────────────────────────
        // Program has @@unique([institutionId, code]) → use compound key
        const programMap = new Map<string, string>();
        for (const p of dto.programs) {
          const departmentId = departmentMap.get(p.departmentCode);
          const program = await tx.program.upsert({
            where: { institutionId_code: { institutionId, code: p.code } },
            update: {
              name: p.name,
              level: p.level as any,
              durationYears: p.durationYears,
              departmentId,
            },
            create: {
              institutionId,
              code: p.code,
              name: p.name,
              level: p.level as any,
              durationYears: p.durationYears,
              departmentId,
            },
          });
          programMap.set(p.code, program.id);
        }

        // ── Step 4–7: Process each curriculum ──────────────────────────────
        for (const c of dto.curriculums) {
          const programId = programMap.get(c.programCode)!;

          // Resolve academic year
          let academicYearId: string;
          if (dto.academicYearCode) {
            const ay = await tx.academicYear.findFirst({
              where: { institutionId, name: dto.academicYearCode },
            });
            if (!ay) {
              throw new BadRequestException(
                `Academic year "${dto.academicYearCode}" not found for this institution`,
              );
            }
            academicYearId = ay.id;
          } else {
            const ay = await tx.academicYear.findFirst({
              where: { institutionId },
              orderBy: { createdAt: 'desc' },
            });
            if (!ay) {
              throw new BadRequestException(
                'No academic year found for this institution; please create one first',
              );
            }
            academicYearId = ay.id;
          }

          // Find or create curriculum
          // Curriculum has @@unique([institutionId, name, versionNumber])
          const versionNumber = c.versionNumber ?? 'v1.0';
          let curriculum = await tx.curriculum.findUnique({
            where: {
              institutionId_name_versionNumber: {
                institutionId,
                name: c.curriculumName,
                versionNumber,
              },
            },
            include: {
              programs: { select: { id: true } },
            },
          });
          if (!curriculum) {
            curriculum = await tx.curriculum.create({
              data: {
                institutionId,
                name: c.curriculumName,
                versionNumber,
                effectiveFrom: new Date(),
                status: 'DRAFT',
                programs: { connect: [{ id: programId }] },
              },
              include: {
                programs: { select: { id: true } },
              },
            });
          } else if (!curriculum.programs.some((p) => p.id === programId)) {
            curriculum = await tx.curriculum.update({
              where: { id: curriculum.id },
              data: {
                programs: { connect: [{ id: programId }] },
              },
              include: {
                programs: { select: { id: true } },
              },
            });
          }
          const curriculumId = curriculum.id;

          // ── Step 5–7: Process each term ───────────────────────────────
          for (const term of c.terms) {
            totalTerms++;

            // CurriculumTerm has @@unique([curriculumId, sequence]) → findFirst
            let curriculumTerm = await tx.curriculumTerm.findFirst({
              where: { curriculumId, sequence: term.sequence },
            });
            if (!curriculumTerm) {
              curriculumTerm = await tx.curriculumTerm.create({
                data: {
                  institutionId,
                  curriculumId,
                  name: term.name,
                  sequence: term.sequence,
                },
              });
            }
            const termId = curriculumTerm.id;

            // ── Step 6: Upsert curriculum courses and prerequisites ────
            for (let idx = 0; idx < term.courses.length; idx++) {
              const tc = term.courses[idx];
              const courseId = courseMap.get(tc.courseCode)!;

              // CurriculumCourse has @@unique([curriculumTermId, courseId])
              const existingCc = await tx.curriculumCourse.findFirst({
                where: { curriculumTermId: termId, courseId },
              });
              if (!existingCc) {
                await tx.curriculumCourse.create({
                  data: {
                    institutionId,
                    curriculumTermId: termId,
                    courseId,
                    sequence: idx + 1,
                    isMandatory: tc.isMandatory,
                    creditValue: null,
                  },
                });
              }

              // Prerequisites: CoursePrerequisite has @@unique([courseId, prerequisiteCourseId])
              for (const prereqCode of tc.prerequisites ?? []) {
                const prereqCourseId = courseMap.get(prereqCode);
                if (!prereqCourseId) continue;
                const existingPrereq = await tx.coursePrerequisite.findFirst({
                  where: { courseId, prerequisiteCourseId: prereqCourseId },
                });
                if (!existingPrereq) {
                  await tx.coursePrerequisite.create({
                    data: {
                      institutionId,
                      courseId,
                      prerequisiteCourseId: prereqCourseId,
                    },
                  });
                }
              }
            }

            // ── Step 7: Upsert sections linked to this curriculum term ─
            for (const s of term.sections) {
              totalSections++;
              const existing = await tx.section.findFirst({
                where: {
                  institutionId,
                  programId,
                  curriculumTermId: termId,
                  code: s.code,
                  academicYearId,
                },
              });
              if (!existing) {
                await tx.section.create({
                  data: {
                    institutionId,
                    programId,
                    curriculumTermId: termId,
                    code: s.code,
                    name: s.name,
                    capacity: s.capacity,
                    academicYearId,
                    semester: term.sequence,
                  },
                });
              }
            }
          }
        }
      },
      { timeout: 120000 },
    );

    return {
      success: true,
      countSummary: {
        departments: dto.departments.length,
        courses: dto.courses.length,
        programs: dto.programs.length,
        terms: totalTerms,
        sections: totalSections,
      },
    };
  }
}
