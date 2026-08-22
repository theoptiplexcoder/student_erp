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
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/sections')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(user.institutionId, createSectionDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('batchId') batchId?: string,
    @Query('programId') programId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.sectionsService.findAll(
      user.institutionId,
      pageNum,
      sizeNum,
      search,
      batchId,
      programId,
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sectionsService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(user.institutionId, id, updateSectionDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sectionsService.remove(user.institutionId, id);
  }
}
