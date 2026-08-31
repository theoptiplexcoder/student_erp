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
      },
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    return faculty;
  }

  async createFaculty(institutionId: string, data: CreateFacultyDto) {
    return this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: { email: data.email, institutionId },
      });

      if (!user) {
        // Create user in Supabase
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

        user = await tx.user.create({
          data: {
            institutionId,
            authUserId: authData.user.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: 'FACULTY',
          },
        });
      }

      return tx.faculty.create({
        data: {
          institutionId,
          userId: user.id,
          departmentId: data.departmentId,
          teacherCode: data.teacherCode,
          employmentType: data.employmentType,
          hireDate: new Date(data.hireDate),
          status: data.status || 'ACTIVE',
        },
        include: {
          user: true,
          department: true,
        },
      });
    });
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

    return this.prisma.courseAssignment.create({
      data: {
        institutionId,
        facultyId,
        courseId: data.courseId,
        sectionId: data.sectionId,
        termId: data.termId,
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
