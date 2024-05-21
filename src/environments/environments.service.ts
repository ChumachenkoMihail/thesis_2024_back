import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateEnvironmentDto,
  DeleteEnvironmentDto,
  GetProjectEnvironments,
} from './dto/environment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnvironmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEnvironment(userId: number, body: CreateEnvironmentDto) {
    const isEnvironmentExists =
      await this.prismaService.projectEnvironments.findFirst({
        where: {
          name: body.name,
        },
      });
    if (isEnvironmentExists) {
      throw new BadRequestException(
        `Environment with name ${body.name} already exists`,
      );
    }

    const project = await this.prismaService.projects.findUnique({
      where: {
        id: body.projectId,
      },
    });
    if (project.userId !== userId) {
      throw new BadRequestException('Only owner can create environments');
    }

    return this.prismaService.projectEnvironments.create({
      data: {
        projectId: project.id,
        userId: userId,
        name: body.name,
      },
    });
  }

  async deleteEnvironment(userId: number, body: DeleteEnvironmentDto) {
    const isEnvironmentExists =
      await this.prismaService.projectEnvironments.findFirst({
        where: {
          id: body.environmentId,
        },
      });
    if (isEnvironmentExists) {
      throw new BadRequestException(
        `Environment with id ${body.environmentId} does not exists`,
      );
    }

    const project = await this.prismaService.projects.findUnique({
      where: {
        id: isEnvironmentExists.projectId,
      },
    });
    if (project.userId !== userId) {
      throw new BadRequestException('Only owner can create environments');
    }

    await this.prismaService.bugs.updateMany({
      where: {
        environmentId: isEnvironmentExists.id,
      },
      data: {
        environmentId: null,
      },
    });

    await this.prismaService.projectEnvironments.delete({
      where: {
        id: body.environmentId,
      },
    });

    return {
      mesage: 'Environment successfully deleted',
    };
  }

  async getProjectEnvironments(userId: number, body: GetProjectEnvironments) {
    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(body.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }
    return this.prismaService.projectEnvironments.findMany({
      where: {
        projectId: body.projectId,
      },
    });
  }
}
