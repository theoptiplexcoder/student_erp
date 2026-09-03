import { Module } from '@nestjs/common';
import { FacultySectionsController } from './faculty-sections.controller';
import { FacultySectionsService } from './faculty-sections.service';

@Module({
  controllers: [FacultySectionsController],
  providers: [FacultySectionsService],
  exports: [FacultySectionsService],
})
export class FacultySectionsModule {}
