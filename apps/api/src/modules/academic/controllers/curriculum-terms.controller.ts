import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurriculumTermsService } from '../services/curriculum-terms.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { CreateCurriculumTermDto, UpdateCurriculumTermDto } from '../dto/curriculum-term.dto';

@Controller('academic/curriculum-terms')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CurriculumTermsController {
  constructor(private readonly curriculumTermsService: CurriculumTermsService) {}

  @Get()
  findAllByCurriculum(@CurrentUser() user: any, @Query('curriculumId') curriculumId?: string) {
    return this.curriculumTermsService.findAllByCurriculum(user.institutionId, curriculumId);
  }

  @Get(':id/sections')
  getSections(@CurrentUser() user: any, @Param('id') id: string) {
    return this.curriculumTermsService.getSections(user.institutionId, id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateCurriculumTermDto) {
    return this.curriculumTermsService.create(user.institutionId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCurriculumTermDto) {
    return this.curriculumTermsService.update(user.institutionId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.curriculumTermsService.remove(user.institutionId, id);
  }
}
