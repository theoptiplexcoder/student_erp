import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CourseAssignmentsService } from './course-assignments.service';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/course-assignments')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CourseAssignmentsController {
  constructor(private readonly assignmentsService: CourseAssignmentsService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreateCourseAssignmentDto) {
    return this.assignmentsService.create(req.user.institutionId, data);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('courseId') courseId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('termId') termId?: string,
  ) {
    return this.assignmentsService.findAll(req.user.institutionId, courseId, sectionId, termId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.assignmentsService.remove(req.user.institutionId, id);
  }
}
