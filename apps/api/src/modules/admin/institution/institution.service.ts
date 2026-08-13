import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { UpdateInstitutionSettingsDto } from './dto/update-institution-settings.dto';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/academic-year.dto';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar-event.dto';

@Injectable()
export class InstitutionService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  async updateProfile(institutionId: string, dto: UpdateInstitutionDto) {
    return this.prisma.institution.update({
      where: { id: institutionId },
      data: dto,
    });
  }

  async getSettings(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { branding: true },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  async updateSettings(institutionId: string, dto: UpdateInstitutionSettingsDto) {
    return this.prisma.institution.update({
      where: { id: institutionId },
      data: { branding: dto.branding as any },
    });
  }

  // Academic Year
  async getAcademicYears(institutionId: string) {
    return this.prisma.academicYear.findMany({
      where: { institutionId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getAcademicYear(institutionId: string, id: string) {
    const ay = await this.prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!ay) throw new NotFoundException('Academic year not found');
    return ay;
  }

  async createAcademicYear(institutionId: string, dto: CreateAcademicYearDto) {
    return this.prisma.academicYear.create({
      data: {
        ...dto,
        institutionId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async updateAcademicYear(institutionId: string, id: string, dto: UpdateAcademicYearDto) {
    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteAcademicYear(institutionId: string, id: string) {
    return this.prisma.academicYear.delete({
      where: { id },
    });
  }

  // Calendar Event
  async getCalendarEvents(institutionId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { institutionId },
      orderBy: { startAt: 'desc' },
    });
  }

  async getCalendarEvent(institutionId: string, id: string) {
    const event = await this.prisma.calendarEvent.findFirst({
      where: { id, institutionId },
    });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async createCalendarEvent(institutionId: string, dto: CreateCalendarEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        ...dto,
        institutionId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
      },
    });
  }

  async updateCalendarEvent(institutionId: string, id: string, dto: UpdateCalendarEventDto) {
    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...dto,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      },
    });
  }

  async deleteCalendarEvent(institutionId: string, id: string) {
    return this.prisma.calendarEvent.delete({
      where: { id },
    });
  }
}
