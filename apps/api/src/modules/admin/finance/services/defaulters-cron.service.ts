import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DefaultersService } from './defaulters.service';

@Injectable()
export class DefaultersCronService {
  private readonly logger = new Logger(DefaultersCronService.name);

  constructor(private readonly defaultersService: DefaultersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Running daily overdue installments cron job');
    try {
      const result = await this.defaultersService.processOverdueInstallments();
      this.logger.log(
        `Overdue process completed. Processed ${result.scannedCount} installments, created ${result.notificationsSent} notifications.`,
      );
    } catch (error) {
      this.logger.error('Error running defaulters cron job', error);
    }
  }
}
