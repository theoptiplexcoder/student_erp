import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from './modules/academic/academic.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [AuthModule, AcademicModule, AdminModule],
})
export class AppModule {}
