import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ProgramsService } from '../services/programs.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('academic/programs')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createProgramDto: any) {
    return this.programsService.create(user.institutionId, createProgramDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.programsService.findAll(user.institutionId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.programsService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateProgramDto: any) {
    return this.programsService.update(user.institutionId, id, updateProgramDto);
  }
}
