import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CurriculumElectiveGroupsService } from '../services/curriculum-elective-groups.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import {
  CreateCurriculumElectiveGroupDto,
  UpdateCurriculumElectiveGroupDto,
} from '../dto/curriculum-elective-group.dto';

@Controller('academic/curriculum-elective-groups')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CurriculumElectiveGroupsController {
  constructor(private readonly curriculumElectiveGroupsService: CurriculumElectiveGroupsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCurriculumElectiveGroupDto) {
    return this.curriculumElectiveGroupsService.create(user.institutionId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCurriculumElectiveGroupDto,
  ) {
    return this.curriculumElectiveGroupsService.update(user.institutionId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.curriculumElectiveGroupsService.remove(user.institutionId, id);
  }
}
