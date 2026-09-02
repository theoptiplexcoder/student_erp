import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(institutionId: string, query: StudentQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      search,
      departmentId,
      programId,
      academicYearId,
      batchId,
      sectionId,
      termId,
      status,
      gender,
      admissionDateFrom,
      admissionDateTo,
      guardianLinked,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {
      institutionId,
      ...(status && { lifecycleStatus: status }),
      ...(gender && { gender }),
      ...(programId && { programId }),
      ...(departmentId && { program: { departmentId } }),
      ...((batchId || academicYearId || termId) && {
        enrollments: {
          some: {
            status: 'ACTIVE',
            ...(batchId && { batchId }),
            ...(academicYearId && { academicYearId }),
            ...(termId && { termId }),
          },
        },
      }),
      ...(sectionId && { sectionId }),
      ...((admissionDateFrom || admissionDateTo) && {
        admissionDate: {
          ...(admissionDateFrom && { gte: new Date(admissionDateFrom) }),
          ...(admissionDateTo && { lte: new Date(admissionDateTo) }),
        },
      }),
      ...(guardianLinked !== undefined && {
        ...(guardianLinked
          ? {
              OR: [
                { AND: [{ guardianName: { not: null } }, { guardianName: { not: '' } }] },
                { AND: [{ fatherName: { not: null } }, { fatherName: { not: '' } }] },
                { AND: [{ motherName: { not: null } }, { motherName: { not: '' } }] },
              ],
            }
          : {
              AND: [
                { OR: [{ guardianName: null }, { guardianName: '' }] },
                { OR: [{ fatherName: null }, { fatherName: '' }] },
                { OR: [{ motherName: null }, { motherName: '' }] },
              ],
            }),
      }),
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { studentCode: { contains: search, mode: 'insensitive' } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          user: true,
          program: true,
          section: true,
        },
        skip,
        take: pageSize,
        orderBy: sortBy === 'name' ? { user: { firstName: sortOrder } } : { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private resolveIdentifier(identifier: string) {
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        identifier,
      );
    return isUuid ? { id: identifier } : { studentCode: identifier };
  }

  async findOne(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(id), institutionId },
      include: {
        user: true,
        program: true,
        section: true,
        enrollments: {
          include: {
            course: true,
            term: true,
          },
        },
        attendanceRecords: {
          take: 5,
          orderBy: { markedAt: 'desc' },
        },
        studentDocuments: true,
        studentPreviousEducations: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async updateStudent(institutionId: string, id: string, data: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(id), institutionId },
      include: { user: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const { firstName, lastName, phone, ...studentData } = data;

    if (
      firstName !== undefined ||
      lastName !== undefined ||
      phone !== undefined ||
      Object.keys(studentData).length > 0
    ) {
      await this.prisma.$transaction(async (tx) => {
        if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
          const userUpdate: any = {};
          if (firstName !== undefined) userUpdate.firstName = firstName;
          if (lastName !== undefined) userUpdate.lastName = lastName;
          if (phone !== undefined) userUpdate.phone = phone;

          await tx.user.update({
            where: { id: student.userId },
            data: userUpdate,
          });
        }

        if (Object.keys(studentData).length > 0) {
          const mappedData: any = { ...studentData };
          if (mappedData.dateOfBirth) {
            mappedData.dateOfBirth = new Date(mappedData.dateOfBirth);
          }
          await tx.student.update({
            where: { id: student.id },
            data: mappedData,
          });
        }
      });
    }

    return this.findOne(institutionId, id);
  }

  async addDocument(
    institutionId: string,
    studentId: string,
    data: { fileName: string; fileUrl: string; mimeType?: string; size?: number },
  ) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(studentId), institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.studentDocument.create({
      data: {
        institutionId,
        studentId: student.id,
        documentType: 'OTHER',
        title: data.fileName,
        fileUrl: data.fileUrl,
        verificationStatus: 'PENDING',
      },
    });
  }

  async updatePhoto(institutionId: string, studentId: string, photoUrl: string) {
    const student = await this.prisma.student.findFirst({
      where: { ...this.resolveIdentifier(studentId), institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.user.update({
      where: { id: student.userId },
      data: { photoUrl },
    });
  }
}
