import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  RabbitExchanges,
  RabbitQueues,
  RabbitRoutingKeys,
} from '@app/contracts';

@Injectable()
export class RabbitMqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);

  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private confirmChannel: amqp.ConfirmChannel;

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    this.confirmChannel = await this.connection.createConfirmChannel();

    await this.setupTopology(this.channel);
    await this.setupTopology(this.confirmChannel);

    this.logger.log('Connected to RabbitMQ');
  }

  private async setupTopology(channel: amqp.Channel | amqp.ConfirmChannel) {
    await channel.assertExchange(RabbitExchanges.Notifications, 'direct', {
      durable: true,
    });

    await channel.assertQueue(RabbitQueues.Notifications, {
      durable: true,
    });

    await channel.assertQueue(RabbitQueues.NotificationsRetry, {
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': RabbitExchanges.Notifications,
        'x-dead-letter-routing-key': RabbitRoutingKeys.NotificationCreated,
      },
    });

    await channel.assertQueue(RabbitQueues.NotificationsDlq, {
      durable: true,
    });

    await channel.bindQueue(
      RabbitQueues.Notifications,
      RabbitExchanges.Notifications,
      RabbitRoutingKeys.NotificationCreated,
    );

    await channel.bindQueue(
      RabbitQueues.NotificationsRetry,
      RabbitExchanges.Notifications,
      RabbitRoutingKeys.NotificationRetry,
    );

    await channel.bindQueue(
      RabbitQueues.NotificationsDlq,
      RabbitExchanges.Notifications,
      RabbitRoutingKeys.NotificationFailed,
    );
  }

  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    return this.channel;
  }

  async publishJson(
    exchange: string,
    routingKey: string,
    message: unknown,
  ): Promise<void> {
    if (!this.confirmChannel) {
      throw new Error('RabbitMQ confirm channel is not initialized');
    }

    const buffer = Buffer.from(JSON.stringify(message));

    this.confirmChannel.publish(exchange, routingKey, buffer, {
      persistent: true,
      contentType: 'application/json',
    });

    await this.confirmChannel.waitForConfirms();
  }

  async publishJsonWithRetry(
    exchange: string,
    routingKey: string,
    message: unknown,
    maxRetries = 3,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.publishJson(exchange, routingKey, message);
        this.logger.log(`Message published. Attempt=${attempt}`);
        return;
      } catch (error) {
        lastError = error;
        this.logger.error(`Publish failed. Attempt=${attempt}`, error);
        await this.delay(1000 * attempt);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.confirmChannel?.close();
    await this.connection?.close();
  }
}
