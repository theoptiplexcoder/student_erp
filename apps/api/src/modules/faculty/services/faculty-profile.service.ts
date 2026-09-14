import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateFacultyProfileDto } from '../dto/update-faculty-profile.dto';

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

  async updateProfile(userId: string, institutionId: string, data: UpdateFacultyProfileDto) {
    const faculty = await this.getProfile(userId, institutionId);

    const { phone, photoUrl } = data;

    if (phone !== undefined || photoUrl !== undefined) {
      const userUpdate: any = {};
      if (phone !== undefined) userUpdate.phone = phone;
      if (photoUrl !== undefined) userUpdate.photoUrl = photoUrl;

      await this.prisma.user.update({
        where: { id: faculty.userId },
        data: userUpdate,
      });
    }

    return this.getProfile(userId, institutionId);
  }
}
