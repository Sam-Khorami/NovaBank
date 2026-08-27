import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseFormaterInterceptor } from './common/interceptors/response-formater.interceptor';
import { GlobalExceptionFilter } from './common/filters/global.filter';
import { AppLogger } from './common/logger/logger.service';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);

  app.useGlobalInterceptors(new ResponseFormaterInterceptor, new LoggerInterceptor(logger));
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))

  const config = new DocumentBuilder()
  .setTitle("Dental Hub")
  .setDescription("This is a full api for dental hub")
  .setVersion("1.0.0")
  .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization", in: "header" })
  .build()

  const document = SwaggerModule.createDocument(app, config);
  process.env.NODE_ENV === "development" && SwaggerModule.setup("api", app, document, { swaggerOptions: { persistAuthorization: true } });

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
