import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: true, credentials: true });
  
  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('RELOOP E-Waste API')
    .setDescription('E-waste management with Cardano rewards')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 RELOOP Backend running on port ${process.env.PORT || 3000}`);
}

bootstrap();