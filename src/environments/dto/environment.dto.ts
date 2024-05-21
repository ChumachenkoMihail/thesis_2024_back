import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}

export class DeleteEnvironmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  environmentId: number;
}

export class GetProjectEnvironments {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}
