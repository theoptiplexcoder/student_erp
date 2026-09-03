import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FacultySectionsService } from './faculty-sections.service';
import { CreateFacultySectionDto } from './dto/create-faculty-section.dto';
import { UpdateFacultySectionDto } from './dto/update-faculty-section.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/faculty-sections')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FacultySectionsController {
  constructor(private readonly facultySectionsService: FacultySectionsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateFacultySectionDto) {
    return this.facultySectionsService.create(req.user.institutionId, dto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('sectionId') sectionId?: string,
    @Query('facultyId') facultyId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.facultySectionsService.findAll(req.user.institutionId, {
      sectionId,
      facultyId,
      academicYearId,
    });
  }

  @Get('unassigned')
  findUnassigned(
    @Request() req: any,
    @Query('sectionId') sectionId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.facultySectionsService.findUnassigned(
      req.user.institutionId,
      sectionId,
      academicYearId,
    );
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateFacultySectionDto) {
    return this.facultySectionsService.update(req.user.institutionId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.facultySectionsService.remove(req.user.institutionId, id);
  }
}
