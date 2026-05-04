import { Test } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { RabbitMqService } from '@app/common';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const rabbitMqService = {
    publishJsonWithRetry: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: RabbitMqService,
          useValue: rabbitMqService,
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('should publish notification event with eventId', async () => {
    rabbitMqService.publishJsonWithRetry.mockResolvedValue(undefined);

    const result = await service.create({
      chatId: '123',
      message: 'Hello',
    });

    expect(result.status).toBe('published');
    expect(result.eventId).toBeDefined();
    expect(rabbitMqService.publishJsonWithRetry).toHaveBeenCalledTimes(1);
  });
});
