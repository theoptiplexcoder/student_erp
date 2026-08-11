import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { CurriculumTermsService } from '../services/curriculum-terms.service';

@Controller('academic/curriculum-terms')
export class CurriculumTermsController {
  constructor(private readonly curriculumTermsService: CurriculumTermsService) {}

  @Post()
  create(@Request() req: any, @Body() createCurriculumTermDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumTermsService.create(institutionId, createCurriculumTermDto);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateCurriculumTermDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.curriculumTermsService.update(institutionId, id, updateCurriculumTermDto);
  }
}
