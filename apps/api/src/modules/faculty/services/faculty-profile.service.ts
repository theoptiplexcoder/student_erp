import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FacultyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId },
      include: {
        user: true,
        department: true,
        institution: true,
      },
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return faculty;
  }
}
