import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { DeleteOrganizationDto } from '../organizations/dto/createOrganization.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  GetProjectStatsDto,
  GetUserProjectsInOrganizationDto,
  RemoveProjectMemberDto,
  RenameProjectDto,
} from './dto/projects.dto';
import {
  AddUsersToProjectDto,
  GetProjectBugs,
  GetProjectUsers,
  UsersAndProjectDto,
} from './dto/addUsersToProject.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RemoveMemberDto } from '../organizations/dto/orgMembers.dto';

@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}
  @Post('create-project')
  @UseGuards(AccessTokenGuard)
  async createOrg(
    @Body() body: CreateProjectDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.createProject(userId, body);
  }

  @Post('get-project-stats')
  @UseGuards(AccessTokenGuard)
  async getProjectStats(
    @Body() body: GetProjectStatsDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.getProjectStats(userId, body);
  }

  @Post('rename-project')
  @UseGuards(AccessTokenGuard)
  async renameOrg(
    @Body() body: RenameProjectDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.renameProject(userId, body);
  }

  @Post('delete-user-from-project')
  @UseGuards(AccessTokenGuard)
  async deleteUserFromOrg(
    @Body() body: RemoveProjectMemberDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.deleteUserFromProject(userId, body);
  }

  @Post('get-user-projects')
  @UseGuards(AccessTokenGuard)
  async getUserOrganizations(
    @Body() body: GetUserProjectsInOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectsService.getUserProjects(userId, body);
  }

  @Post('delete-project')
  @UseGuards(AccessTokenGuard)
  async deleteOrganization(
    @Body() body: DeleteOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.deleteProject(userId, body);
  }

  @Post('add-user-to-project')
  @UseGuards(AccessTokenGuard)
  async addUsersToProject(
    @Body() body: UsersAndProjectDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.projectsService.addUsersToProject(userId, body);
  }

  @Post('get-project-users')
  @UseGuards(AccessTokenGuard)
  async getProjectUsers(
    @Body() body: GetProjectUsers,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectsService.getProjectUsers(userId, body);
  }

  @Get('get-project-bugs/:projectId')
  @UseGuards(AccessTokenGuard)
  async getProjectBugs(
    @Param('projectId') projectId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.projectsService.getProjectBugs(userId, { projectId });
  }
}
