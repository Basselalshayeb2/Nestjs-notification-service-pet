import { NestFactory } from '@nestjs/core';
import { TelegramServiceModule } from './telegram-service.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(TelegramServiceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Telegram Service')
  .setDescription('Sends notifications through Telegram Bot API')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.TELEGRAM_PORT || 3002;
  await app.listen(port);

  console.log(`Telegram service is running on port ${port}`);
}
bootstrap();
