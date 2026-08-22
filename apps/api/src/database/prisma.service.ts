import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let url = process.env['DATABASE_URL'];

    // Auto-append connection limit if not present to prevent EMAXCONNSESSION errors on Render/Supabase
    // connection_limit=5 keeps us well under Supabase's session-mode pool_size of 15
    // pool_timeout=10s (default) — fail fast instead of hanging when pool is exhausted;
    // pool_timeout=0 causes indefinite hangs → port scan timeout → crash-restart loops that leak connections
    if (url && !url.includes('connection_limit')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}connection_limit=5&pool_timeout=10000`;
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
