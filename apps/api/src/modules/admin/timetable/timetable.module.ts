import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { SessionOccurrenceController } from './controllers/session-occurrence.controller';
import { SessionOccurrenceService } from './services/session-occurrence.service';

@Module({
  controllers: [TimetableController, SessionOccurrenceController],
  providers: [TimetableService, SessionOccurrenceService],
  exports: [SessionOccurrenceService],
})
export class TimetableModule {}
