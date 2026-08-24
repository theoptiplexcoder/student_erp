import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CurriculumsService } from '../services/curriculums.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { CreateCurriculumDto, UpdateCurriculumDto } from '../dto/curriculum.dto';
import { DuplicateCurriculumDto, ImportCurriculumDto } from '../dto/curriculum-operations.dto';

@Controller('academic/curriculums')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Post('import')
  importCurriculum(@CurrentUser() user: any, @Body() importDto: ImportCurriculumDto) {
    return this.curriculumsService.importCurriculum(user.institutionId, importDto);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createCurriculumDto: CreateCurriculumDto) {
    const institutionId = user.institutionId;
    return this.curriculumsService.create(institutionId, createCurriculumDto);
  }

  @Get('program/:programId')
  findByProgram(@CurrentUser() user: any, @Param('programId') programId: string) {
    const institutionId = user.institutionId;
    return this.curriculumsService.findByProgram(institutionId, programId);
  }

  @Get(':id/export')
  exportCurriculum(@CurrentUser() user: any, @Param('id') id: string) {
    return this.curriculumsService.exportCurriculum(user.institutionId, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const institutionId = user.institutionId;
    return this.curriculumsService.findOne(institutionId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    const institutionId = user.institutionId;
    return this.curriculumsService.update(institutionId, id, updateCurriculumDto);
  }

  @Post(':id/duplicate')
  duplicate(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: DuplicateCurriculumDto,
  ) {
    return this.curriculumsService.duplicate(user.institutionId, id, dto);
  }

  @Post(':id/validate')
  validate(@CurrentUser() user: any, @Param('id') id: string) {
    const institutionId = user.institutionId;
    return this.curriculumsService.validateCurriculum(institutionId, id);
  }

  @Post(':id/activate')
  activate(@CurrentUser() user: any, @Param('id') id: string) {
    const institutionId = user.institutionId;
    return this.curriculumsService.activateCurriculum(institutionId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    const institutionId = user.institutionId;
    return this.curriculumsService.remove(institutionId, id);
  }
}
