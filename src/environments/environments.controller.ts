import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateEnvironmentDto,
  DeleteEnvironmentDto,
  GetProjectEnvironments,
} from './dto/environment.dto';

@Controller('environments')
@ApiTags('environments')
@ApiBearerAuth()
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Post('create-environment')
  @UseGuards(AccessTokenGuard)
  async createEnvironment(
    @Body() body: CreateEnvironmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.environmentsService.createEnvironment(userId, body);
  }

  @Post('delete-environment')
  @UseGuards(AccessTokenGuard)
  async deleteEnvironment(
    @Body() body: DeleteEnvironmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.environmentsService.deleteEnvironment(userId, body);
  }

  @Post('get-project-environments')
  @UseGuards(AccessTokenGuard)
  async getProjectEnvironments(
    @Body() body: GetProjectEnvironments,
    @CurrentUser('userId') userId: number,
  ) {
    return this.environmentsService.getProjectEnvironments(userId, body);
  }
}
