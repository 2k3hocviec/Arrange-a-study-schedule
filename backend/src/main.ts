import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllHttpExceptionFilter } from './exceptions/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: ['error', 'warn'],
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllHttpExceptionFilter());
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép frontend này
    // origi: true // cho toàn bộ front end đăng nhập
    credentials: true, // Cho phép cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(8000);
  // await app.listen(8000, '0.0.0.0');
}
bootstrap();
