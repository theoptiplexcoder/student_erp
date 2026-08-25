import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StudentAcademicService } from './modules/students/services/student-academic.service';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const academicService = app.get(StudentAcademicService);

  const user = await prisma.user.findFirst({ where: { email: 'student1@demo-institute.test' } });
  if (!user) throw new Error('Student user not found');

  const terms = await academicService.getTerms(user.id, user.institutionId);
  console.log(
    'Terms found for student:',
    terms.map((t) => `${t.name} (${t.status})`),
  );

  for (const term of terms) {
    const courses = await academicService.getCourses(user.id, user.institutionId, term.id);
    console.log(`\nCourses in ${term.name}: ${courses.length}`);
    for (const c of courses) {
      console.log(`  - ${c['code']} ${c['name']} | Status: ${c.status}`);
      // If marks were joined or available somehow
    }
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
