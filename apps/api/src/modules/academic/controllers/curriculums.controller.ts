import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { CurriculumsService } from '../services/curriculums.service';

@Controller('academic/curriculums')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Post()
  create(@Request() req: any, @Body() createCurriculumDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumsService.create(institutionId, createCurriculumDto);
  }

  @Get('program/:programId')
  findByProgram(@Request() req: any, @Param('programId') programId: string) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumsService.findByProgram(institutionId, programId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumsService.findOne(institutionId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateCurriculumDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumsService.update(institutionId, id, updateCurriculumDto);
  }

  @Patch(':id/publish')
  publish(@Request() req: any, @Param('id') id: string) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumsService.publish(institutionId, id);
  }
}
