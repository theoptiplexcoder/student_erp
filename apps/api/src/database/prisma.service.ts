import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let url = process.env['DATABASE_URL'];

    if (url) {
      const params: string[] = [];
      if (!url.includes('connection_limit')) params.push('connection_limit=2');
      if (!url.includes('pool_timeout')) params.push('pool_timeout=15000');
      // Required for Supabase transaction-mode pgbouncer — disables prepared statements.
      if (!url.includes('pgbouncer')) params.push('pgbouncer=true');

      if (params.length) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}${params.join('&')}`;
      }
    }

    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  async onModuleInit() {
    // Retry $connect with backoff — during deploys, old instances still hold
    // server-side pool slots. Waiting lets them drain naturally.
    const maxRetries = 8;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (err) {
        if (attempt === maxRetries) {
          this.logger.error(`Failed to connect to database after ${maxRetries} attempts`, err);
          throw err;
        }
        const delay = Math.min(attempt * 3000, 30000);
        this.logger.warn(
          `DB connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
