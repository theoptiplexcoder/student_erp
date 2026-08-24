import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { FacultyExaminationsService } from '../services/faculty-examinations.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/examinations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyExaminationsController {
  constructor(private readonly examsService: FacultyExaminationsService) {}

  @Get()
  getExaminations(@CurrentUser() user: any) {
    return this.examsService.getExaminations(user.id, user.institutionId);
  }

  @Get(':examCourseId/marks')
  getExamMarks(@CurrentUser() user: any, @Param('examCourseId') examCourseId: string) {
    return this.examsService.getExamMarks(user.id, user.institutionId, examCourseId);
  }

  @Post(':examCourseId/marks')
  saveMarks(
    @CurrentUser() user: any,
    @Param('examCourseId') examCourseId: string,
    @Body() data: any,
  ) {
    return this.examsService.saveMarks(user.id, user.institutionId, examCourseId, data);
  }
}
