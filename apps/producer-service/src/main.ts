import { NestFactory } from '@nestjs/core';
import { ProducerServiceModule } from './producer-service.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RabbitMqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ProducerServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const rabbitMqService = app.get(RabbitMqService);
  await rabbitMqService.connect();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Producer Service')
    .setDescription('Publishes notification events to RabbitMQ')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PRODUCER_PORT || 3000;

  await app.listen(port);
  console.log(`Producer service is running on port ${port}`);
}
bootstrap();
