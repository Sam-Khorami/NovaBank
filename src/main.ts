import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseFormaterInterceptor } from './common/interceptors/response-formater.interceptor';
import { GlobalExceptionFilter } from './common/filters/global.filter';
import { AppLogger } from './common/logger/logger.service';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { ValidationPipe } from '@nestjs/common';
import compression from "compression";
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from "path";

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(AppLogger);

  app.useGlobalInterceptors(new ResponseFormaterInterceptor, new LoggerInterceptor(logger));
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  app.useStaticAssets(join(__dirname, "..", "uploads"), { prefix: "/uploads/" });

  app.use(compression());

  const config = new DocumentBuilder()
  .setTitle("Dental Hub")
  .setDescription("This is a full api for dental hub")
  .setVersion("1.0.0")
  .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization", in: "header" })
  .build()

  const document = SwaggerModule.createDocument(app, config);
  process.env.NODE_ENV === "development" && SwaggerModule.setup("api", app, document, { swaggerOptions: { 
    
    persistAuthorization: true, 
    operationsSorter: (a, b) => { const order = { get: 1, post: 2, patch: 3, put: 4, delete: 5 }; return order[a.get('method')] - order[b.get('method')] } 
  
  } });

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
