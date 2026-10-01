import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ActiveTermService } from './active-term.service';

@Global()
@Module({
  providers: [PrismaService, ActiveTermService],
  exports: [PrismaService, ActiveTermService],
})
export class DatabaseModule {}
