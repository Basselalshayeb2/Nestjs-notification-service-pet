import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramClientService {
  private readonly logger = new Logger(TelegramClientService.name);

  async sendMessage(chatId: string, message: string): Promise<void> {
    const baseUrl = process.env.TELEGRAM_SERVICE_URL || 'http://localhost:3002';

    await axios.post(`${baseUrl}/telegram/send`, {
      chatId,
      message,
    });

    this.logger.log(`Request sent to telegram-service for chatId=${chatId}`);
  }
}
