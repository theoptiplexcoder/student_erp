import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from './modules/academic/academic.module';

@Module({
  imports: [AuthModule, AcademicModule],
})
export class AppModule {}
