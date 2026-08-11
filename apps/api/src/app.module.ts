import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from './modules/academic/academic.module';
import { CoursesModule } from './modules/admin/courses/courses.module';

@Module({
  imports: [AuthModule, AcademicModule, CoursesModule],
})
export class AppModule {}
