import { Controller, Post, Request } from '@nestjs/common';
import { DemoService } from './demo.service';
import { Roles } from '../../../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/demo')
@Roles(UserRole.ADMIN)
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('seed-student-portal')
  async seedStudentPortal(@Request() req: any) {
    const { institutionId } = req.user;
    return this.demoService.seedData(institutionId);
  }
}
