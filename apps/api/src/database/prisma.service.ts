import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let url = process.env['DATABASE_URL'];

    // Auto-append connection limit if not present to prevent EMAXCONNSESSION errors on Render/Supabase
    if (url && !url.includes('connection_limit')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}connection_limit=5&pool_timeout=0`;
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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
