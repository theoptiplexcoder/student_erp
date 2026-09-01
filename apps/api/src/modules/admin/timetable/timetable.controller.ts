import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CreateTimetableEntryDto,
  UpdateTimetableEntryDto,
  MoveTimetableEntryDto,
  ReassignFacultyDto,
  BulkUpdateTimetableDto,
  GenerateTimetableDto,
  BulkDeleteTimetableDto,
  SwapSlotsDto,
} from './dto';
import { TimetableDay } from '@prisma/client';

@Controller('admin/timetable')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  async createEntry(@CurrentUser() user: any, @Body() data: CreateTimetableEntryDto) {
    return this.timetableService.create(user.institutionId, data);
  }

  @Get('conflicts')
  async listConflicts(@CurrentUser() user: any, @Query('termId') termId: string) {
    return this.timetableService.listConflicts(user.institutionId, termId);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@CurrentUser() user: any, @Body() data: GenerateTimetableDto) {
    return this.timetableService.generate(user.institutionId, data);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@CurrentUser() user: any, @Body('termId') termId: string) {
    throw new NotImplementedException('Validate is not implemented yet');
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  async publish(@CurrentUser() user: any, @Body('termId') termId: string) {
    throw new NotImplementedException('Publish is not implemented yet');
  }

  @Post('duplicate')
  @HttpCode(HttpStatus.OK)
  async duplicate(@CurrentUser() user: any, @Body() data: any) {
    throw new NotImplementedException('Duplicate is not implemented yet');
  }

  @Get('export')
  async exportTimetable(
    @CurrentUser() user: any,
    @Query('termId') termId: string,
    @Query('format') format: 'csv' | 'json',
  ) {
    throw new NotImplementedException('Export is not implemented yet');
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importTimetable(@CurrentUser() user: any, @Body() data: any) {
    throw new NotImplementedException('Import is not implemented yet');
  }

  @Post('reassign-faculty')
  @HttpCode(HttpStatus.OK)
  async reassignFaculty(@CurrentUser() user: any, @Body() data: ReassignFacultyDto) {
    return this.timetableService.reassignFaculty(user.institutionId, data);
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(@CurrentUser() user: any, @Body() data: BulkUpdateTimetableDto) {
    return this.timetableService.bulkUpdate(user.institutionId, data);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@CurrentUser() user: any, @Body() data: BulkDeleteTimetableDto) {
    return this.timetableService.bulkDelete(user.institutionId, data.entryIds);
  }

  @Post('swap-slots')
  @HttpCode(HttpStatus.OK)
  async swapSlots(
    @CurrentUser() user: any,
    @Body() data: SwapSlotsDto,
  ) {
    return this.timetableService.swapSlots(user.institutionId, data.entryIdA, data.entryIdB);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('termId') termId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('facultyId') facultyId?: string,
    @Query('dayOfWeek') dayOfWeek?: TimetableDay,
  ) {
    return this.timetableService.findAll(user.institutionId, {
      termId,
      sectionId,
      facultyId,
      dayOfWeek,
    });
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.timetableService.findOne(user.institutionId, id);
  }

  @Patch(':id')
  async updateEntry(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: UpdateTimetableEntryDto,
  ) {
    return this.timetableService.update(user.institutionId, id, data);
  }

  @Delete(':id')
  async removeEntry(@CurrentUser() user: any, @Param('id') id: string) {
    return this.timetableService.remove(user.institutionId, id);
  }

  @Post(':id/move')
  @HttpCode(HttpStatus.OK)
  async moveEntry(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: MoveTimetableEntryDto,
  ) {
    return this.timetableService.moveEntry(user.institutionId, id, data);
  }
}
