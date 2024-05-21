import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UsersAndProjectDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  projectId: number;
}
export class AddUsersToProjectDto {
  @ApiProperty({
    type: [UsersAndProjectDto],
  })
  rightPairs: UsersAndProjectDto[];
}

export class GetProjectUsers {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}

export class GetProjectBugs {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  projectId: number;
}
