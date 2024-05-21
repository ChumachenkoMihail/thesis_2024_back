import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId: number;
}

export class RenameProjectDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RemoveProjectMemberDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}

export class GetProjectStatsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}

export class GetUserProjectsInOrganizationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  organizationId: number;
}
