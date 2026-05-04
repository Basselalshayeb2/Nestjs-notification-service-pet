import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendTelegramMessageDto {
  @ApiProperty({
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    example: 'Hello from Telegram service',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}