import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendTelegramMessageDto } from './dto/send-telegram-message.dto';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send')
  @ApiOperation({
    summary: 'Send message to Telegram chat',
  })
  send(@Body() dto: SendTelegramMessageDto) {
    return this.telegramService.sendMessage(dto.chatId, dto.message);
  }
}