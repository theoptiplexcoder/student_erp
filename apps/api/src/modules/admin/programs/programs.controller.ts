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
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Controller('admin/programs')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  async createProgram(@CurrentUser() user: any, @Body() dto: CreateProgramDto) {
    return this.programsService.createProgram(user.institutionId, dto);
  }

  @Get(':id')
  async getProgramById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.programsService.getProgramById(user.institutionId, id);
  }

  @Get()
  async getPrograms(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 50;
    return this.programsService.getPrograms(user.institutionId, pageNum, sizeNum, search);
  }

  @Patch(':id')
  async updateProgram(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.updateProgram(user.institutionId, id, dto);
  }

  @Delete(':id')
  async removeProgram(@CurrentUser() user: any, @Param('id') id: string) {
    return this.programsService.removeProgram(user.institutionId, id);
  }
}
