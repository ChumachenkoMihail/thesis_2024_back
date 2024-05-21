import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  RenameOrganizationDto,
} from './dto/createOrganization.dto';
import { OrganizationsService } from './organizations.service';
import {
  AcceptInviteDto,
  InviteMemberDto,
  RemoveMemberDto,
} from './dto/orgMembers.dto';

@Controller('organizations')
@ApiTags('organizations')
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('create-organization')
  @UseGuards(AccessTokenGuard)
  async createOrg(
    @Body() body: CreateOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.createOrganization(userId, body);
  }

  @Post('delete-user-from-org')
  @UseGuards(AccessTokenGuard)
  async deleteUserFromOrg(
    @Body() body: RemoveMemberDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.deleteUserFromOrg(userId, body);
  }

  @Post('rename-organization')
  @UseGuards(AccessTokenGuard)
  async renameOrg(
    @Body() body: RenameOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.renameOrganization(userId, body);
  }

  @Get('get-user-organizations')
  @UseGuards(AccessTokenGuard)
  async getUserOrganizations(@CurrentUser('userId') userId: number) {
    return this.organizationsService.getUserOrganizations(userId);
  }

  @Post('delete-organization')
  @UseGuards(AccessTokenGuard)
  async deleteOrganization(
    @Body() body: DeleteOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.deleteOrganization(userId, body);
  }

  @Post('invite-member')
  @UseGuards(AccessTokenGuard)
  async sendMemberInvite(
    @Body() body: InviteMemberDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.inviteMember(userId, body);
  }

  @Post('accept-invite')
  @UseGuards(AccessTokenGuard)
  async acceptInvite(
    @Body() body: AcceptInviteDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.acceptInvite(userId, body);
  }

  @Post('decline-invite')
  @UseGuards(AccessTokenGuard)
  async declineInvite(
    @Body() body: AcceptInviteDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.organizationsService.declineInvite(userId, body);
  }

  @Post('get-org-users')
  @UseGuards(AccessTokenGuard)
  async getOrgUsers(
    @Body() body: DeleteOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.organizationsService.getOrgUsers(userId, body);
  }

  @Post('get-org-projects')
  @UseGuards(AccessTokenGuard)
  async getOrgProjects(
    @Body() body: DeleteOrganizationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.organizationsService.getOrgProjects(userId, body);
  }

  @Get('get-org-with-projects')
  @UseGuards(AccessTokenGuard)
  async getOrgWithProjects(@CurrentUser('userId') userId: number) {
    return this.organizationsService.getOrgWithProjects(userId);
  }
}
