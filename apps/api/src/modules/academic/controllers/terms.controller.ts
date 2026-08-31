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
import { TermsService } from '../services/terms.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';

@Controller('academic/terms')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.termsService.create(user.institutionId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('curriculumId') curriculumId?: string) {
    return this.termsService.findAll(user.institutionId, curriculumId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.termsService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.termsService.update(user.institutionId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.termsService.remove(user.institutionId, id);
  }
}
