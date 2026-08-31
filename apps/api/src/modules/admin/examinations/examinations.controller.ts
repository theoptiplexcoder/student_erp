import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { ExaminationsService } from './examinations.service';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { ScheduleExamDto } from './dto/schedule-exam.dto';

@Controller('admin/examinations')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ExaminationsController {
  constructor(private readonly examinationsService: ExaminationsService) {}

  @Post('schedule')
  async schedule(@Request() req: any, @Body() dto: ScheduleExamDto) {
    const { institutionId } = req.user;
    return this.examinationsService.schedule(institutionId, dto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const { institutionId } = req.user;
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.examinationsService.findAll(institutionId, pageNum, sizeNum, search);
  }

  @Get('results')
  findResults(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const { institutionId } = req.user;
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.examinationsService.findResults(institutionId, pageNum, sizeNum, search);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const { institutionId } = req.user;
    return this.examinationsService.remove(institutionId, id);
  }
}
