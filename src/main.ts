import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseFormaterInterceptor } from './common/interceptors/response-formater.interceptor';
import { GlobalExceptionFilter } from './common/filters/global.filter';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseFormaterInterceptor);
  app.useGlobalFilters(new GlobalExceptionFilter);

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
