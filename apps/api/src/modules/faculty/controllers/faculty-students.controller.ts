import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacultyStudentsService } from '../services/faculty-students.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('faculty/students')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('FACULTY')
export class FacultyStudentsController {
  constructor(private readonly studentsService: FacultyStudentsService) {}

  @Get()
  getStudents(@CurrentUser() user: any) {
    return this.studentsService.getStudents(user.id, user.institutionId);
  }
}
