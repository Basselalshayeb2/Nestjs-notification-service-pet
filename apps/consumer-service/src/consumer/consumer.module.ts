import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { TelegramClientService } from './telegram-client.service';

@Module({
  providers: [ConsumerService, TelegramClientService],
})
export class ConsumerModule {}