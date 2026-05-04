import { Module } from '@nestjs/common';
import { ConsumerServiceController } from './consumer-service.controller';
import { ConsumerServiceService } from './consumer-service.service';
import { RabbitMqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { ConsumerModule } from './consumer/consumer.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMqModule,
    ConsumerModule,
  ],
  controllers: [ConsumerServiceController],
  providers: [ConsumerServiceService],
})
export class ConsumerServiceModule {}
