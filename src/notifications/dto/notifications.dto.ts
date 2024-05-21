import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetNotificationAsReadDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  notificationId: number;
}
