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
      programId,
      batchId,
      sectionId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StudentWhereInput = {
      institutionId,
      ...(status && { lifecycleStatus: status }),
      ...(programId && { programId }),
      ...(batchId && { enrollments: { some: { batchId, status: 'ACTIVE' } } }),
      ...(sectionId && { sectionId }),
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

  async findOne(institutionId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
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
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async updateStudent(institutionId: string, id: string, data: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
      include: { user: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const { firstName, lastName, phone, ...studentData } = data;

    if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
      const userUpdate: any = {};
      if (firstName !== undefined) userUpdate.firstName = firstName;
      if (lastName !== undefined) userUpdate.lastName = lastName;
      if (phone !== undefined) userUpdate.phone = phone;

      await this.prisma.user.update({
        where: { id: student.userId },
        data: userUpdate,
      });
    }

    if (Object.keys(studentData).length > 0) {
      const mappedData: any = { ...studentData };
      if (mappedData.dateOfBirth) {
        mappedData.dateOfBirth = new Date(mappedData.dateOfBirth);
      }
      await this.prisma.student.update({
        where: { id: student.id },
        data: mappedData,
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
      where: { id: studentId, institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.studentDocument.create({
      data: {
        institutionId,
        studentId,
        documentType: 'OTHER',
        title: data.fileName,
        fileUrl: data.fileUrl,
        verificationStatus: 'PENDING',
      },
    });
  }

  async updatePhoto(institutionId: string, studentId: string, photoUrl: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.user.update({
      where: { id: student.userId },
      data: { photoUrl },
    });
  }
}
