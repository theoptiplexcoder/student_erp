import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExaminationTypesService } from './examination-types.service';
import { CreateExaminationTypeDto, UpdateExaminationTypeDto } from './dto/examination-type.dto';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('admin/examinations/types')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ExaminationTypesController {
  constructor(private readonly examTypesService: ExaminationTypesService) {}

  @Get()
  findAll(@Request() req: any) {
    const { institutionId } = req.user;
    return this.examTypesService.findAll(institutionId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const { institutionId } = req.user;
    return this.examTypesService.findOne(institutionId, id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateExaminationTypeDto) {
    const { institutionId } = req.user;
    return this.examTypesService.create(institutionId, dto);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateExaminationTypeDto) {
    const { institutionId } = req.user;
    return this.examTypesService.update(institutionId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const { institutionId } = req.user;
    return this.examTypesService.remove(institutionId, id);
  }
}
