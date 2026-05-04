import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    example: 'Hello from NestJS + RabbitMQ',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
