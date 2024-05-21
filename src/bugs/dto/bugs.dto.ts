import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum BugStatusesEnum {
  BACKLOG = 'BACKLOG',
  IN_PROGRESS = 'IN_PROGRESS',
  TODO = 'TODO',
  COMPLETED = 'COMPLETED',
  QA = 'QA',
}

export enum PlatformEnum {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MODILE = 'MODILE',
  EMBEDDED = 'EMBEDDED',
  WEB = 'WEB',
}

export class CreateBugDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ enum: BugStatusesEnum })
  @IsEnum(BugStatusesEnum)
  @IsOptional()
  status?: string;

  @ApiProperty({ enum: PlatformEnum })
  @IsEnum(PlatformEnum)
  @IsOptional()
  platform?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  realize?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  testAsText?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  codeAsText?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  environmentId: number;
}

export class UpdateBugDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ enum: BugStatusesEnum })
  @IsEnum(BugStatusesEnum)
  @IsOptional()
  status?: string;

  @ApiProperty({ enum: PlatformEnum })
  @IsEnum(PlatformEnum)
  @IsOptional()
  platform?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  realize?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  bugId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  testAsText?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  codeAsText?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  environmentId: number;
}

export class DeleteBugDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;
}

export class DeleteBugAttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  attachmentId: number;
}

export class GetBug {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;
}

export class DownloadAttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  attachmentId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bugId: number;
}
