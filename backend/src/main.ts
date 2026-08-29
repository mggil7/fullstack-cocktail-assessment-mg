import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('Cocktails API')
    .setDescription('CRUD API for the cocktail recipes app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('Backend listening on port 3000 - docs at /api/docs');
}
bootstrap();
