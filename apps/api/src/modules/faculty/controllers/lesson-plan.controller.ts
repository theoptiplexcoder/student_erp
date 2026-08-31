import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LessonPlanService } from '../services/lesson-plan.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreateLessonPlanDto, UpdateLessonPlanDto } from '../dto/lesson-plan.dto';
import { Request } from 'express';

@Controller('faculty/courses')
@UseGuards(JwtAuthGuard)
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Get(':courseId/lesson-plans')
  getLessonPlans(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Query('termId') termId?: string,
  ) {
    return this.lessonPlanService.getLessonPlans(
      req.user['userId'],
      req.user['institutionId'],
      courseId,
      termId,
    );
  }

  @Post(':courseId/lesson-plans')
  createLessonPlan(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonPlanDto,
  ) {
    return this.lessonPlanService.createLessonPlan(
      req.user['userId'],
      req.user['institutionId'],
      courseId,
      dto,
    );
  }

  @Get(':courseId/lesson-plans/:id')
  getLessonPlan(@Req() req: Request, @Param('courseId') courseId: string, @Param('id') id: string) {
    return this.lessonPlanService.getLessonPlan(req.user['userId'], req.user['institutionId'], id);
  }

  @Patch(':courseId/lesson-plans/:id')
  updateLessonPlan(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonPlanDto,
  ) {
    return this.lessonPlanService.updateLessonPlan(
      req.user['userId'],
      req.user['institutionId'],
      id,
      dto,
    );
  }

  @Post(':courseId/lesson-plans/:id/complete')
  completeLessonPlan(
    @Req() req: Request,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: { actualCompletionDate: string; reflectionNotes?: string },
  ) {
    return this.lessonPlanService.completeLessonPlan(
      req.user['userId'],
      req.user['institutionId'],
      id,
      dto,
    );
  }
}
