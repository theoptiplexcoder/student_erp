import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateLessonPlanDto, UpdateLessonPlanDto } from '../dto/lesson-plan.dto';
import { LessonPlanStatus } from '@prisma/client';

@Injectable()
export class LessonPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getLessonPlans(userId: string, institutionId: string, courseId: string, termId?: string) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const whereClause: any = { facultyId: faculty.id, institutionId, courseId };
    if (termId) whereClause.termId = termId;

    const plans = await this.prisma.lessonPlan.findMany({
      where: whereClause,
      include: {
        sections: { include: { section: true } },
        resources: { include: { resource: true } },
      },
      orderBy: [{ sequence: 'asc' }, { plannedDate: 'asc' }],
    });

    // Auto-calculate statuses before returning
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return plans.map((p) => {
      let calcStatus = p.status;
      if (p.actualCompletionDate) {
        calcStatus = 'COMPLETED';
      } else if (p.status !== 'DRAFT' && p.status !== 'CANCELLED') {
        const pd = new Date(p.plannedDate);
        pd.setHours(0, 0, 0, 0);

        const dl = p.deadline ? new Date(p.deadline) : pd;
        dl.setHours(0, 0, 0, 0);

        if (dl < today) calcStatus = 'OVERDUE';
        else if (pd <= today) calcStatus = 'IN_PROGRESS';
        else calcStatus = 'SCHEDULED';
      }
      return { ...p, status: calcStatus };
    });
  }

  async getLessonPlan(userId: string, institutionId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const plan = await this.prisma.lessonPlan.findFirst({
      where: { id, facultyId: faculty.id, institutionId },
      include: {
        sections: { include: { section: true } },
        resources: { include: { resource: true } },
      },
    });

    if (!plan) throw new NotFoundException('Lesson plan not found');
    return plan;
  }

  async createLessonPlan(
    userId: string,
    institutionId: string,
    courseId: string,
    dto: CreateLessonPlanDto,
  ) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    // Get max sequence
    const lastPlan = await this.prisma.lessonPlan.findFirst({
      where: { courseId, facultyId: faculty.id, termId: dto.termId },
      orderBy: { sequence: 'desc' },
    });
    const sequence = lastPlan ? lastPlan.sequence + 1 : 1;

    const data: any = {
      institutionId,
      courseId,
      facultyId: faculty.id,
      termId: dto.termId,
      title: dto.title,
      description: dto.description,
      unitId: dto.unitId,
      chapterId: dto.chapterId,
      sequence,
      plannedDate: new Date(dto.plannedDate),
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      durationMinutes: dto.durationMinutes,
      teachingMethod: dto.teachingMethod,
      status: dto.status || 'DRAFT',
      learningObjectives: dto.learningObjectives || [],
      teachingPlan: dto.teachingPlan || [],
    };

    return this.prisma.$transaction(async (prisma) => {
      const plan = await prisma.lessonPlan.create({ data });

      if (dto.sectionIds && dto.sectionIds.length > 0) {
        await prisma.lessonPlanSection.createMany({
          data: dto.sectionIds.map((sid) => ({
            lessonPlanId: plan.id,
            sectionId: sid,
          })),
        });
      }

      if (dto.resourceIds && dto.resourceIds.length > 0) {
        await prisma.lessonPlanResource.createMany({
          data: dto.resourceIds.map((rid, index) => ({
            lessonPlanId: plan.id,
            resourceId: rid,
            sortOrder: index,
          })),
        });
      }

      return prisma.lessonPlan.findUnique({
        where: { id: plan.id },
        include: { sections: true, resources: true },
      });
    });
  }

  async updateLessonPlan(
    userId: string,
    institutionId: string,
    id: string,
    dto: UpdateLessonPlanDto,
  ) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    const existing = await this.prisma.lessonPlan.findFirst({
      where: { id, facultyId: faculty.id, institutionId },
    });
    if (!existing) throw new NotFoundException('Lesson plan not found');

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.plannedDate !== undefined) updateData.plannedDate = new Date(dto.plannedDate);
    if (dto.deadline !== undefined)
      updateData.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;
    if (dto.teachingMethod !== undefined) updateData.teachingMethod = dto.teachingMethod;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.learningObjectives !== undefined)
      updateData.learningObjectives = dto.learningObjectives;
    if (dto.teachingPlan !== undefined) updateData.teachingPlan = dto.teachingPlan;
    if (dto.teachingNotes !== undefined) updateData.teachingNotes = dto.teachingNotes;
    if (dto.reflectionNotes !== undefined) updateData.reflectionNotes = dto.reflectionNotes;

    return this.prisma.$transaction(async (prisma) => {
      const plan = await prisma.lessonPlan.update({
        where: { id },
        data: updateData,
      });

      if (dto.sectionIds !== undefined) {
        await prisma.lessonPlanSection.deleteMany({ where: { lessonPlanId: id } });
        if (dto.sectionIds.length > 0) {
          await prisma.lessonPlanSection.createMany({
            data: dto.sectionIds.map((sid) => ({ lessonPlanId: id, sectionId: sid })),
          });
        }
      }

      if (dto.resourceIds !== undefined) {
        await prisma.lessonPlanResource.deleteMany({ where: { lessonPlanId: id } });
        if (dto.resourceIds.length > 0) {
          await prisma.lessonPlanResource.createMany({
            data: dto.resourceIds.map((rid, index) => ({
              lessonPlanId: id,
              resourceId: rid,
              sortOrder: index,
            })),
          });
        }
      }

      return prisma.lessonPlan.findUnique({
        where: { id },
        include: { sections: true, resources: true },
      });
    });
  }

  async completeLessonPlan(
    userId: string,
    institutionId: string,
    id: string,
    dto: { actualCompletionDate: string; reflectionNotes?: string },
  ) {
    const faculty = await this.prisma.faculty.findFirst({ where: { userId, institutionId } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    return this.prisma.lessonPlan.update({
      where: { id, facultyId: faculty.id, institutionId },
      data: {
        status: 'COMPLETED',
        actualCompletionDate: new Date(dto.actualCompletionDate),
        reflectionNotes: dto.reflectionNotes,
      },
    });
  }
}
