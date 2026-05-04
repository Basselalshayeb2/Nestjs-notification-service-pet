import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMqService } from '@app/common';
import {
  NotificationCreatedEvent,
  RabbitExchanges,
  RabbitQueues,
  RabbitRoutingKeys,
} from '@app/contracts';
import { TelegramClientService } from './telegram-client.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ConsumerService.name);

  private readonly processedEvents = new Set<string>();
  private readonly maxRetries = 3;

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly telegramClientService: TelegramClientService,
  ) {}

  async onModuleInit() {
    const channel = this.rabbitMqService.getChannel();

    await channel.prefetch(1);

    await channel.consume(RabbitQueues.Notifications, async (message) => {
      if (!message) {
        return;
      }

      try {
        const event = this.parseMessage(message.content);

        this.logger.log(
          `Received eventId=${event.eventId}, retryCount=${event.retryCount}`,
        );

        if (this.processedEvents.has(event.eventId)) {
          this.logger.warn(`Duplicate event ignored: ${event.eventId}`);
          channel.ack(message);
          return;
        }

        await this.telegramClientService.sendMessage(
          event.payload.chatId,
          event.payload.message,
        );

        this.processedEvents.add(event.eventId);

        this.logger.log(`Event processed successfully: ${event.eventId}`);
        channel.ack(message);
      } catch (error) {
        this.logger.error('Message processing failed', error);

        await this.handleFailedMessage(message);

        channel.ack(message);
      }
    });

    this.logger.log(`Consumer started. Queue=${RabbitQueues.Notifications}`);
  }

  private parseMessage(content: Buffer): NotificationCreatedEvent {
    const parsed = JSON.parse(content.toString()) as NotificationCreatedEvent;

    if (
      !parsed.eventId ||
      !parsed.payload?.chatId ||
      !parsed.payload?.message
    ) {
      throw new Error('Invalid message format');
    }

    return parsed;
  }

  private async handleFailedMessage(message: unknown) {
    const event = this.parseMessage((message as any).content);

    const retryCount = event.retryCount || 0;

    if (retryCount < this.maxRetries) {
      const retryEvent: NotificationCreatedEvent = {
        ...event,
        retryCount: retryCount + 1,
      };

      await this.rabbitMqService.publishJson(
        RabbitExchanges.Notifications,
        RabbitRoutingKeys.NotificationRetry,
        retryEvent,
      );

      this.logger.warn(
        `Event sent to retry queue. eventId=${event.eventId}, retryCount=${retryEvent.retryCount}`,
      );

      return;
    }

    await this.rabbitMqService.publishJson(
      RabbitExchanges.Notifications,
      RabbitRoutingKeys.NotificationFailed,
      event,
    );

    this.logger.error(`Event sent to DLQ. eventId=${event.eventId}`);
  }
}
