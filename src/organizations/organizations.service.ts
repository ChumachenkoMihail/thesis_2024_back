import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrganizationDto,
  DeleteOrganizationDto,
  RenameOrganizationDto,
} from './dto/createOrganization.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  AcceptInviteDto,
  InviteMemberDto,
  RemoveMemberDto,
} from './dto/orgMembers.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrganization(userId: number, body: CreateOrganizationDto) {
    const isOrganizationExists =
      await this.prismaService.organization.findFirst({
        where: {
          name: body.name,
          userId: userId,
        },
      });
    if (isOrganizationExists) {
      throw new BadRequestException(
        `Організація з іменем ${body.name} вже існує`,
      );
    }
    const createdOrganization = await this.prismaService.organization.create({
      data: {
        name: body.name,
        userId: userId,
      },
    });

    await this.prismaService.organozationMembers.create({
      data: {
        userId: userId,
        organizationId: createdOrganization.id,
      },
    });
    return createdOrganization;
  }

  async renameOrganization(userId: number, body: RenameOrganizationDto) {
    const isOrganizationExists =
      await this.prismaService.organization.findFirst({
        where: {
          id: body.id,
          userId: userId,
        },
      });
    if (!isOrganizationExists) {
      throw new BadRequestException(`No organization with ${body.id}`);
    }
    if (isOrganizationExists.name === body.name) {
      throw new BadRequestException(
        `Нове ім'я повинно відрязнятися від старого`,
      );
    }
    const isNameDuplicates = await this.prismaService.organization.findFirst({
      where: {
        name: body.name,
        NOT: [
          {
            id: body.id,
          },
        ],
      },
    });

    if (isNameDuplicates) {
      throw new BadRequestException(
        `Організація з іменем ${body.name} вже існує`,
      );
    }

    return this.prismaService.organization.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
      },
    });
  }

  async getUserOrganizations(userId: number) {
    const userInOrganizations =
      await this.prismaService.organozationMembers.findMany({
        where: {
          userId: userId,
        },
      });
    console.log(userInOrganizations);
    const organizationIds = userInOrganizations.map(
      (item) => item.organizationId,
    );

    return this.prismaService.organization.findMany({
      where: {
        id: {
          in: organizationIds,
        },
      },
    });
  }

  async deleteOrganization(userId: number, body: DeleteOrganizationDto) {
    console.log(body.id);
    console.log(userId);
    const isOrganizationExists =
      await this.prismaService.organization.findFirst({
        where: {
          id: Number(body.id),
          userId: userId,
        },
      });
    if (!isOrganizationExists) {
      throw new BadRequestException(`No organization with ${body.id}`);
    }

    await this.prismaService.organization.delete({
      where: {
        id: body.id,
        userId: userId,
      },
    });

    return {
      message: 'Organization successfully deleted',
    };
  }

  async inviteMember(userId: number, body: InviteMemberDto) {
    const inviteOrg = await this.prismaService.organization.findFirst({
      where: {
        id: body.organizationId,
        userId: userId,
      },
      include: {
        owner: true,
      },
    });
    console.log(inviteOrg);
    if (!inviteOrg) {
      throw new BadRequestException(
        'Тільки власник може додавати нових користувачів',
      );
    }

    const invitedMember = await this.prismaService.user.findFirst({
      where: {
        login: body.login,
      },
    });
    if (!invitedMember) {
      throw new BadRequestException(
        `Немає користувача з логіном ${body.login}`,
      );
    }

    const checkIfUserAlreadyMember =
      await this.prismaService.organozationMembers.findFirst({
        where: {
          organizationId: body.organizationId,
          userId: invitedMember.id,
        },
      });
    if (checkIfUserAlreadyMember) {
      throw new BadRequestException('User already organization member');
    }

    await this.prismaService.notifications.create({
      data: {
        text: `${inviteOrg.owner.firstName} ${inviteOrg.owner.lastName} запросив вас до огранізації ${inviteOrg.name}`,
        fromUserId: userId,
        toUserId: invitedMember.id,
        content: 'INVITE',
        organizationId: inviteOrg.id,
        valid: true,
      },
    });

    return {
      message: 'Member successfully invited',
    };
  }

  async deleteUserFromOrg(userId: number, body: RemoveMemberDto) {
    const inviteOrg = await this.prismaService.organization.findFirst({
      where: {
        id: body.organizationId,
        userId: userId,
      },
      include: {
        owner: true,
      },
    });
    if (!inviteOrg) {
      throw new BadRequestException(
        'Тільки власник може запрошувати нових членів організації',
      );
    }
    const invitedMember = await this.prismaService.user.findFirst({
      where: {
        id: body.userId,
      },
    });
    if (!invitedMember) {
      throw new BadRequestException(
        `No user with login ${invitedMember.login}`,
      );
    }

    await this.prismaService.projectMembers.deleteMany({
      where: {
        userId: body.userId,
        project: {
          organizationId: body.organizationId,
        },
      },
    });

    // Удаляем пользователя из организации
    await this.prismaService.organozationMembers.deleteMany({
      where: {
        userId: body.userId,
        organizationId: body.organizationId,
      },
    });

    await this.prismaService.bugs.updateMany({
      where: {
        project: {
          organizationId: body.organizationId,
        },
        assigneeUserId: body.userId, // Только если текущий исполнитель - этот пользователь
      },
      data: {
        assigneeUserId: null,
      },
    });

    return {
      message: 'Member successfully invited',
    };
  }

  async acceptInvite(userId: number, body: AcceptInviteDto) {
    const checkInvite = await this.prismaService.notifications.findFirst({
      where: {
        toUserId: userId,
        organizationId: body.organizationId,
        valid: true,
      },
    });

    if (!checkInvite) {
      throw new BadRequestException('Invite expired');
    }
    await this.prismaService.organozationMembers.create({
      data: {
        userId: userId,
        organizationId: body.organizationId,
      },
    });

    await this.prismaService.notifications.update({
      where: {
        id: checkInvite.id,
      },
      data: {
        valid: false,
        status: 'READ',
      },
    });

    return {
      message: 'Now you are member of organization',
    };
  }

  async declineInvite(userId: number, body: AcceptInviteDto) {
    const checkInvite = await this.prismaService.notifications.findFirst({
      where: {
        toUserId: userId,
        organizationId: body.organizationId,
        valid: true,
        // status: 'READ',
      },
    });

    if (!checkInvite) {
      throw new BadRequestException('Invite expired');
    }

    await this.prismaService.notifications.update({
      where: {
        id: checkInvite.id,
      },
      data: {
        valid: false,
      },
    });

    return {
      message: 'You successfully declined invite',
    };
  }

  async getOrgUsers(userId: number, body: DeleteOrganizationDto) {
    return this.prismaService.organozationMembers.findMany({
      where: {
        organizationId: body.id,
      },
      include: {
        user: true,
      },
    });
  }

  async getOrgProjects(userId: number, body: DeleteOrganizationDto) {
    return this.prismaService.projects.findMany({
      where: {
        organizationId: body.id,
        ProjectMembers: {
          some: {
            userId: userId,
          },
        },
      },
    });
  }

  async getOrgWithProjects(userId: number) {
    return this.prismaService.organization.findMany({
      where: {
        OrganozationMembers: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        Projects: {
          where: {
            ProjectMembers: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
    });
  }
}
