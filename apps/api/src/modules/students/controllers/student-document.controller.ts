import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StudentDocumentService } from '../services/student-document.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student/documents')
@Roles(UserRole.STUDENT)
export class StudentDocumentController {
  constructor(private readonly documentService: StudentDocumentService) {}

  @Get()
  async getDocuments(@Request() req: any) {
    const { id: authUserId, institutionId } = req.user;
    return this.documentService.getDocuments(authUserId, institutionId);
  }
}
