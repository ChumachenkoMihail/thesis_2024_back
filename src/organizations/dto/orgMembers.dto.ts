import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;
}

export class RemoveMemberDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;
}

export class AcceptInviteDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;
}
