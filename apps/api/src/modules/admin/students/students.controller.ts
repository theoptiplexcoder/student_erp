import { Controller, Get, Post, Put, Body, Param, Query, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentQueryDto } from './dto/student-query.dto';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/students')
@Roles(UserRole.ADMIN)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Request() req: any, @Query() query: StudentQueryDto) {
    const { institutionId } = req.user;
    return this.studentsService.findAll(institutionId, query);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const { institutionId } = req.user;
    return this.studentsService.findOne(institutionId, id);
  }

  @Post(':id/documents')
  addDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: { fileName: string; fileUrl: string; mimeType?: string; size?: number },
  ) {
    const { institutionId } = req.user;
    return this.studentsService.addDocument(institutionId, id, data);
  }

  @Put(':id/photo')
  updatePhoto(@Request() req: any, @Param('id') id: string, @Body() data: { photoUrl: string }) {
    const { institutionId } = req.user;
    return this.studentsService.updatePhoto(institutionId, id, data.photoUrl);
  }
}
