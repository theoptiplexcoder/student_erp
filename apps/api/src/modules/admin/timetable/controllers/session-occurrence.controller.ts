import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionOccurrenceService } from '../services/session-occurrence.service';
import { CurrentUser } from '../../../../decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../../guards/roles.guard';
import { Roles } from '../../../../decorators/roles.decorator';
import { SessionOccurrenceStatus } from '@prisma/client';
import {
  GenerateSessionOccurrencesDto,
  CancelSessionOccurrenceDto,
  RescheduleSessionOccurrenceDto,
} from '../dto/generate-session-occurrences.dto';

@Controller('admin/timetable/session-occurrences')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SessionOccurrenceController {
  constructor(private readonly sessionOccurrenceService: SessionOccurrenceService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@CurrentUser() user: any, @Body() dto: GenerateSessionOccurrencesDto) {
    return this.sessionOccurrenceService.generate(user.institutionId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('termId') termId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
  ) {
    return this.sessionOccurrenceService.findAll(user.institutionId, {
      termId,
      sectionId,
      courseId,
      status: status as SessionOccurrenceStatus | undefined,
    });
  }

  @Get('planning-summary')
  async getPlanningSummary(
    @CurrentUser() user: any,
    @Query('termId') termId: string,
    @Query('sectionId') sectionId: string,
  ) {
    return this.sessionOccurrenceService.getPlanningSummary(user.institutionId, termId, sectionId);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sessionOccurrenceService.findOne(user.institutionId, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelSessionOccurrenceDto,
  ) {
    return this.sessionOccurrenceService.cancel(user.institutionId, id, dto.reason);
  }

  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  async reschedule(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RescheduleSessionOccurrenceDto,
  ) {
    return this.sessionOccurrenceService.reschedule(user.institutionId, id, dto);
  }
}
