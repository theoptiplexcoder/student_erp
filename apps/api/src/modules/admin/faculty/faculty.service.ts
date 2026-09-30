import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class FacultyService {
  private supabase;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    );
  }

  async getFaculty(institutionId: string, page = 1, pageSize = 50, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.FacultyWhereInput = {
      institutionId,
      ...(search
        ? {
            OR: [
              { user: { firstName: { contains: search, mode: 'insensitive' } } },
              { user: { lastName: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { teacherCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.faculty.count({ where }),
      this.prisma.faculty.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          department: true,
          roles: { include: { customRole: true } },
        },
        orderBy: { user: { lastName: 'asc' } },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getFacultyById(institutionId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, institutionId },
      include: {
        user: true,
        department: true,
        roles: { include: { customRole: true } },
      },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    return faculty;
  }

  async createFaculty(institutionId: string, data: CreateFacultyDto) {
    // Step 1: create Supabase auth user OUTSIDE the DB transaction so we can
    // clean it up if the DB steps fail.
    let supabaseUserId: string | null = null;
    let existingAuthUser = false;

    let dbUser = await this.prisma.user.findFirst({
      where: { email: data.email, institutionId },
    });

    if (!dbUser) {
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'FACULTY',
          institutionId,
        },
      });

      if (authError) {
        throw new BadRequestException(`Failed to create auth user: ${authError.message}`);
      }

      supabaseUserId = authData.user.id;
    } else {
      existingAuthUser = true;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (!dbUser) {
          dbUser = await tx.user.create({
            data: {
              institutionId,
              authUserId: supabaseUserId!,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              role: 'FACULTY',
            },
          });
        }

        const faculty = await tx.faculty.create({
          data: {
            institutionId,
            userId: dbUser.id,
            departmentId: data.departmentId,
            teacherCode: data.teacherCode,
            employmentType: data.employmentType,
            hireDate: new Date(data.hireDate),
            status: data.status || 'ACTIVE',
          },
        });

        // Assign institutional roles if provided
        if (data.roleIds && data.roleIds.length > 0) {
          await tx.facultyRole.createMany({
            data: data.roleIds.map((customRoleId) => ({
              facultyId: faculty.id,
              customRoleId,
            })),
            skipDuplicates: true,
          });
        }

        return tx.faculty.findUniqueOrThrow({
          where: { id: faculty.id },
          include: {
            user: true,
            department: true,
            roles: { include: { customRole: true } },
          },
        });
      });
    } catch (err) {
      // If the Supabase auth user was freshly created but the DB transaction
      // failed, delete the orphaned auth account.
      if (supabaseUserId && !existingAuthUser) {
        await this.supabase.auth.admin.deleteUser(supabaseUserId);
      }
      throw err;
    }
  }

  async updateFaculty(institutionId: string, id: string, data: UpdateFacultyDto) {
    const faculty = await this.getFacultyById(institutionId, id);

    return this.prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName || data.email || data.phone) {
        await tx.user.update({
          where: { id: faculty.userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
        });
      }

      // Replace institutional roles when roleIds is explicitly provided
      if (data.roleIds !== undefined) {
        await tx.facultyRole.deleteMany({ where: { facultyId: id } });
        if (data.roleIds.length > 0) {
          await tx.facultyRole.createMany({
            data: data.roleIds.map((customRoleId) => ({ facultyId: id, customRoleId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.faculty.update({
        where: { id },
        data: {
          departmentId: data.departmentId,
          teacherCode: data.teacherCode,
          employmentType: data.employmentType,
          hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
          exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
          status: data.status,
        },
        include: {
          user: true,
          department: true,
          roles: { include: { customRole: true } },
        },
      });
    });
  }

  async deleteFaculty(institutionId: string, id: string) {
    const faculty = await this.getFacultyById(institutionId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.faculty.delete({ where: { id } });
      // Soft-delete or just leave user as inactive. For now, delete user if they only have faculty role
      // But keeping it simple: just delete the faculty record.
      // await tx.user.delete({ where: { id: faculty.userId } });
      return { success: true };
    });
  }

  async getFacultyAssignments(institutionId: string, facultyId: string) {
    return this.prisma.courseAssignment.findMany({
      where: { institutionId, facultyId },
      include: {
        course: true,
        section: true,
        term: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignFacultyClass(
    institutionId: string,
    facultyId: string,
    data: CreateCourseAssignmentDto,
  ) {
    // Verify faculty belongs to institution
    await this.getFacultyById(institutionId, facultyId);

    let termId = data.termId;

    if (!termId) {
      // Look up section to get its academicYearId
      const section = await this.prisma.section.findFirst({
        where: { id: data.sectionId, institutionId },
        select: { academicYearId: true },
      });

      // Try finding ACTIVE term in the section's academic year, or any active term
      let term = null;
      if (section?.academicYearId) {
        term = await this.prisma.academicTerm.findFirst({
          where: {
            institutionId,
            academicYearId: section.academicYearId,
            status: 'ACTIVE',
          },
        });
        if (!term) {
          term = await this.prisma.academicTerm.findFirst({
            where: {
              institutionId,
              academicYearId: section.academicYearId,
            },
            orderBy: { startDate: 'desc' },
          });
        }
      }

      if (!term) {
        term = await this.prisma.academicTerm.findFirst({
          where: { institutionId, status: 'ACTIVE' },
        });
      }

      if (!term) {
        term = await this.prisma.academicTerm.findFirst({
          where: { institutionId },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!term) {
        // Fallback: If no academic term exists yet for the institution/academic year, auto-create a default active term
        let academicYearId = section?.academicYearId;
        if (!academicYearId) {
          let activeAy = await this.prisma.academicYear.findFirst({
            where: { institutionId, isActive: true },
          });
          if (!activeAy) {
            activeAy = await this.prisma.academicYear.findFirst({
              where: { institutionId },
              orderBy: { createdAt: 'desc' },
            });
          }
          if (!activeAy) {
            const currentYear = new Date().getFullYear();
            activeAy = await this.prisma.academicYear.create({
              data: {
                institutionId,
                name: `${currentYear}-${currentYear + 1}`,
                startDate: new Date(`${currentYear}-01-01`),
                endDate: new Date(`${currentYear}-12-31`),
                isActive: true,
              },
            });
          }
          academicYearId = activeAy.id;
        }

        const currentYear = new Date().getFullYear();
        term = await this.prisma.academicTerm.create({
          data: {
            institutionId,
            academicYearId,
            name: `Default Term ${currentYear}`,
            code: `TERM-${currentYear}`,
            startDate: new Date(`${currentYear}-01-01`),
            endDate: new Date(`${currentYear}-12-31`),
            status: 'ACTIVE',
          },
        });
      }

      termId = term.id;
    }

    return this.prisma.courseAssignment.create({
      data: {
        institutionId,
        facultyId,
        courseId: data.courseId,
        sectionId: data.sectionId,
        termId,
        isPrimary: data.isPrimary ?? true,
      },
      include: {
        course: true,
        section: true,
        term: true,
      },
    });
  }
}
