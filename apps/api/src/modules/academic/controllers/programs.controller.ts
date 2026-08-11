import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ProgramsService } from '../services/programs.service';

@Controller('academic/programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  create(@Request() req: any, @Body() createProgramDto: any) {
    // Assuming institutionId is injected by a middleware/guard into req.user or req.tenant
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.programsService.create(institutionId, createProgramDto);
  }

  @Get()
  findAll(@Request() req: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.programsService.findAll(institutionId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.programsService.findOne(institutionId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateProgramDto: any) {
    const institutionId = req.user?.institutionId || 'dummy-institution-id';
    return this.programsService.update(institutionId, id, updateProgramDto);
  }
}
