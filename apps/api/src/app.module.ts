import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AcademicModule } from './modules/academic/academic.module';
import { AdminModule } from './modules/admin/admin.module';
import { DatabaseModule } from './database/database.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [DatabaseModule, AuthModule, AcademicModule, AdminModule, StudentsModule],
})
export class AppModule {}
