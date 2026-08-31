import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { LessonPlanService } from '../services/lesson-plan.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateLessonPlanDto, UpdateLessonPlanDto } from '../dto/lesson-plan.dto';

@Controller('faculty/courses')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Get(':courseId/lesson-plans')
  getLessonPlans(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Query('termId') termId?: string,
  ) {
    return this.lessonPlanService.getLessonPlans(user.id, user.institutionId, courseId, termId);
  }

  @Post(':courseId/lesson-plans')
  createLessonPlan(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonPlanDto,
  ) {
    return this.lessonPlanService.createLessonPlan(user.id, user.institutionId, courseId, dto);
  }

  @Get(':courseId/lesson-plans/:id')
  getLessonPlan(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
  ) {
    return this.lessonPlanService.getLessonPlan(user.id, user.institutionId, id);
  }

  @Patch(':courseId/lesson-plans/:id')
  updateLessonPlan(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonPlanDto,
  ) {
    return this.lessonPlanService.updateLessonPlan(user.id, user.institutionId, id, dto);
  }

  @Post(':courseId/lesson-plans/:id/complete')
  completeLessonPlan(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: { actualCompletionDate: string; reflectionNotes?: string },
  ) {
    return this.lessonPlanService.completeLessonPlan(user.id, user.institutionId, id, dto);
  }
}
