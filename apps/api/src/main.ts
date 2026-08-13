import * as path from 'path';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  const app = await NestFactory.create(AppModule);

  app.use('/health', (_req: any, res: any) => {
    res.json({ status: 'ok' });
  });

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
      'https://student-erp-web.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] || process.env['API_PORT'] || 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
