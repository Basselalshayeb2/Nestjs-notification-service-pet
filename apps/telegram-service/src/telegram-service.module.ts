import { Module } from '@nestjs/common';
import { TelegramServiceController } from './telegram-service.controller';
import { TelegramServiceService } from './telegram-service.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegramModule,
  ],
  controllers: [TelegramServiceController],
  providers: [TelegramServiceService],
})
export class TelegramServiceModule {}
