import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  notifyAssignee: boolean;
}

export class DeleteComment {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  commentId: number;
}
