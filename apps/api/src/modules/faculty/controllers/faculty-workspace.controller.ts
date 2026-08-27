import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FacultyWorkspaceService } from '../services/faculty-workspace.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('faculty/workspace/:courseId')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyWorkspaceController {
  constructor(private readonly workspaceService: FacultyWorkspaceService) {}

  @Get('resources')
  getResources(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.workspaceService.getResources(user.id, user.institutionId, courseId);
  }

  @Post('resources')
  createResource(@CurrentUser() user: any, @Param('courseId') courseId: string, @Body() data: any) {
    return this.workspaceService.createResource(user.id, user.institutionId, courseId, data);
  }

  @Delete('resources/:id')
  deleteResource(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
  ) {
    return this.workspaceService.deleteResource(user.id, user.institutionId, courseId, id);
  }

  @Get('assignments')
  getAssignments(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.workspaceService.getAssignments(user.id, user.institutionId, courseId);
  }

  @Post('assignments')
  createAssignment(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() data: any,
  ) {
    return this.workspaceService.createAssignment(user.id, user.institutionId, courseId, data);
  }

  @Get('assignments/:assignmentId/submissions')
  getSubmissions(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.workspaceService.getSubmissions(
      user.id,
      user.institutionId,
      courseId,
      assignmentId,
    );
  }

  @Post('assignments/:assignmentId/submissions/:submissionId/grade')
  gradeSubmission(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Param('assignmentId') assignmentId: string,
    @Param('submissionId') submissionId: string,
    @Body() data: any,
  ) {
    return this.workspaceService.gradeSubmission(
      user.id,
      user.institutionId,
      courseId,
      assignmentId,
      submissionId,
      data,
    );
  }
}
