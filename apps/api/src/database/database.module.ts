import { Global, Module } from '@nestjs/common';
import { prisma } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA',
      useValue: prisma,
    },
  ],
  exports: ['PRISMA'],
})
export class DatabaseModule {}
