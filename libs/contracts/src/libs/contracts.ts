// Todo: split to different files
export const RabbitExchanges = {
  Notifications: 'notifications.exchange.tg',
};

export const RabbitRoutingKeys = {
  NotificationCreated: 'notification.created',
  NotificationRetry: 'notification.retry',
  NotificationFailed: 'notification.failed',
};

export const RabbitQueues = {
  Notifications: 'notifications.queue',
  NotificationsRetry: 'notifications.retry.queue',
  NotificationsDlq: 'notifications.dlq',
};

export const EventTypes = {
  NotificationCreated: 'notification.created',
};

export interface NotificationCreatedEvent {
  eventId: string;
  type: typeof EventTypes.NotificationCreated;
  payload: {
    chatId: string;
    message: string;
  };
  createdAt: string;
  retryCount: number;
}
