import { NestFactory } from '@nestjs/core';
import { ConsumerServiceModule } from './consumer-service.module';
import { RabbitMqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ConsumerServiceModule);

  const rabbitMqService = app.get(RabbitMqService);
  await rabbitMqService.connect();

  const port = process.env.CONSUMER_PORT || 3001;
  await app.listen(port);

  console.log(`Consumer service is running on port ${port}`);
}
bootstrap();
