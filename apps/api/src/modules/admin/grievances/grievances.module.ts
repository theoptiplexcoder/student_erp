import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { AdminGrievancesController } from './grievances.controller';
import { AdminGrievancesService } from './grievances.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminGrievancesController],
  providers: [AdminGrievancesService],
})
export class GrievancesModule {}
