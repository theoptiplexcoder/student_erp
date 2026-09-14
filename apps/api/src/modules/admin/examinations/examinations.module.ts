import { Module } from '@nestjs/common';
import { ExaminationsController } from './examinations.controller';
import { ExaminationsService } from './examinations.service';
import { ExaminationTypesController } from './examination-types.controller';
import { ExaminationTypesService } from './examination-types.service';

@Module({
  controllers: [ExaminationsController, ExaminationTypesController],
  providers: [ExaminationsService, ExaminationTypesService],
  exports: [ExaminationsService, ExaminationTypesService],
})
export class ExaminationsModule {}
