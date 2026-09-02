import { Module } from '@nestjs/common';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { AdmissionsEventListener } from './admissions-event.listener';

@Module({
  controllers: [AdmissionsController],
  providers: [AdmissionsService, AdmissionsEventListener],
})
export class AdmissionsModule {}
