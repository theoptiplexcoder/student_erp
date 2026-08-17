import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { StudentCertificateService } from '../services/student-certificate.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('student/certificates')
@Roles(UserRole.STUDENT)
export class StudentCertificateController {
  constructor(private readonly certificateService: StudentCertificateService) {}

  @Get()
  async getCertificates(@Request() req: any) {
    const { id: userId, institutionId } = req.user;
    return this.certificateService.getCertificates(userId, institutionId);
  }

  @Post()
  async createCertificateRequest(@Request() req: any, @Body() data: any) {
    const { id: userId, institutionId } = req.user;
    return this.certificateService.createCertificateRequest(userId, institutionId, data);
  }
}
