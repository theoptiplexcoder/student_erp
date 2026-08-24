import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FacultyGrievanceController } from './controllers/faculty-grievance.controller';
import { FacultyGrievanceService } from './services/faculty-grievance.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FacultyGrievanceController],
  providers: [FacultyGrievanceService],
})
export class FacultyModule {}
