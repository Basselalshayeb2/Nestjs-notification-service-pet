import { EventTypes } from '../enums/eventTypes';

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
