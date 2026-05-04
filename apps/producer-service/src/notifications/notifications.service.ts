import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  EventTypes,
  NotificationCreatedEvent,
  RabbitExchanges,
  RabbitRoutingKeys,
  status,
} from '@app/contracts';
import { RabbitMqService } from '@app/common';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async create(dto: CreateNotificationDto) {
    const event: NotificationCreatedEvent = {
      eventId: randomUUID(),
      type: EventTypes.NotificationCreated,
      payload: {
        chatId: dto.chatId,
        message: dto.message,
      },
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    await this.rabbitMqService.publishJsonWithRetry(
      RabbitExchanges.Notifications,
      RabbitRoutingKeys.NotificationCreated,
      event,
      3,
    );

    return {
      status: status.PUBLISHED,
      eventId: event.eventId,
      event,
    };
  }
}
