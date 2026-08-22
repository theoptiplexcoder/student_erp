import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let url = process.env['DATABASE_URL'];

    // Supabase session-mode pool: max 15 connections shared across ALL services.
    // Keep our ceiling low (3) so other services and leftover connections from
    // crashed/deploying instances don't push us past the server-side limit.
    if (url && !url.includes('connection_limit')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}connection_limit=3&pool_timeout=10000`;
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
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (err) {
        if (attempt === maxRetries) {
          this.logger.error(`Failed to connect to database after ${maxRetries} attempts`, err);
          throw err;
        }
        const delay = attempt * 2000;
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
