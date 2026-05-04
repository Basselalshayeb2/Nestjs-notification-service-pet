import { Module } from '@nestjs/common';
import { ProducerServiceController } from './producer-service.controller';
import { ProducerServiceService } from './producer-service.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqModule } from '@app/common';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMqModule,
    NotificationsModule,
  ],
  controllers: [ProducerServiceController],
  providers: [ProducerServiceService],
})
export class ProducerServiceModule {}
