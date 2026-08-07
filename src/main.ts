import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

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
