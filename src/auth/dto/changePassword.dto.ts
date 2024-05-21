import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'new password (one digit, one capital letter, no whitespaces, 8-128 characters)',
    example: '1Qwerty8',
  })
  newPassword: string;
}
