import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../guards/supabase-auth.guard';
import { RolesGuard } from '../../../guards/roles.guard';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { AcademicBulkImportService } from '../services/academic-bulk-import.service';
import { BulkAcademicImportDto } from '../dto/bulk-academic-import.dto';

@Controller('academic/bulk')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AcademicBulkController {
  constructor(private readonly bulkImportService: AcademicBulkImportService) {}

  @Post('validate')
  validate(@CurrentUser() user: any, @Body() dto: BulkAcademicImportDto) {
    return this.bulkImportService.validate(user.institutionId, dto);
  }

  @Post('ingest')
  ingest(@CurrentUser() user: any, @Body() dto: BulkAcademicImportDto) {
    return this.bulkImportService.ingest(user.institutionId, dto);
  }
}
