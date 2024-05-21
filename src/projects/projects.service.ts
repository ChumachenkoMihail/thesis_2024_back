import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteOrganizationDto } from '../organizations/dto/createOrganization.dto';
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
import { RemoveMemberDto } from '../organizations/dto/orgMembers.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProjectStats(userId: number, body: GetProjectStatsDto) {
    const project = await this.prismaService.projects.findFirst({
      where: {
        id: Number(body.projectId),
      },
    });
    const projectBugs = await this.prismaService.bugs.findMany({
      where: {
        projectId: Number(body.projectId),
      },
      include: {
        assignee: true,
        creator: true,
        project: true,
      },
    });

    const projectUsers = await this.prismaService.projectMembers.findMany({
      where: {
        projectId: body.projectId,
      },
      include: {
        user: true,
      },
    });
    console.log(projectUsers);
    if (projectBugs.length <= 0) {
      return {
        project,
      };
    }
    const totalByStatus = [
      ['In Progress', 0],
      ['Backlog', 0],
      ['Todo', 0],
      ['Completed', 0],
      ['QA', 0],
      ['No status', 0],
    ];
    projectBugs.map((bug) => {
      if (bug.status === 'IN_PROGRESS') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[0][1] = totalByStatus[0][1] + 1;
      }
      if (bug.status === 'BACKLOG') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[1][1] = totalByStatus[1][1] + 1;
      }
      if (bug.status === 'TODO') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[2][1] = totalByStatus[2][1] + 1;
      }
      if (bug.status === 'COMPLETED') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[3][1] = totalByStatus[3][1] + 1;
      }
      if (bug.status === 'QA') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[4][1] = totalByStatus[4][1] + 1;
      }
      if (bug.status === null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        totalByStatus[5][1] = totalByStatus[5][1] + 1;
      }
    });

    const bugCounts = projectBugs.reduce((acc, item) => {
      const assigneeName = item.assignee
        ? `${item.assignee.firstName} ${item.assignee.lastName}`
        : 'Нема виконавця';
      acc[assigneeName] = (acc[assigneeName] || 0) + 1;
      return acc;
    }, {});

    const resultArray = Object.entries(bugCounts).map(
      ([assigneeName, totalBugs]) => [assigneeName, totalBugs],
    );
    resultArray.unshift(['', '']);
    totalByStatus.unshift(['', '']);

    // console.log(resultArray);
    // return projectBugs;

    //new
    const initialStatusCount = {
      IN_PROGRESS: 0,
      TODO: 0,
      QA: 0,
      BACKLOG: 0,
      COMPLETED: 0,
      NO_STATUS: 0,
    };

    const assigneeStats = projectBugs.reduce((acc, bug) => {
      const assigneeName = bug.assignee
        ? `${bug.assignee.firstName} ${bug.assignee.lastName}`
        : 'Нема виконавця';

      if (!acc[assigneeName]) {
        acc[assigneeName] = { ...initialStatusCount };
      }

      switch (bug.status) {
        case 'IN_PROGRESS':
          acc[assigneeName].IN_PROGRESS += 1;
          break;
        case 'TODO':
          acc[assigneeName].TODO += 1;
          break;
        case 'QA':
          acc[assigneeName].QA += 1;
          break;
        case 'BACKLOG':
          acc[assigneeName].BACKLOG += 1;
          break;
        case 'COMPLETED':
          acc[assigneeName].COMPLETED += 1;
          break;
        default:
          acc[assigneeName].NO_STATUS += 1;
          break;
      }

      return acc;
    }, {});

    const statusResultArray = [
      [
        'ASSIGNEE NAME',
        'IN PROGRESS',
        'TODO',
        'QA',
        'BACKLOG',
        'COMPLETED',
        'NO STATUS',
      ],
    ];

    for (const [assigneeName, statusCounts] of Object.entries(assigneeStats)) {
      // @ts-ignore
      statusResultArray.push([
        assigneeName,
        // @ts-ignore

        statusCounts.IN_PROGRESS,
        // @ts-ignore

        statusCounts.TODO,
        // @ts-ignore

        statusCounts.QA,
        // @ts-ignore

        statusCounts.BACKLOG,
        // @ts-ignore

        statusCounts.COMPLETED,
        // @ts-ignore

        statusCounts.NO_STATUS,
      ]);
    }
    //new
    return {
      project: project,
      totalBugs: projectBugs.length,
      totalByStatus,
      resultArray: resultArray,
      statusResultArray: statusResultArray,
    };
  }
  async createProject(userId: number, body: CreateProjectDto) {
    const isProjectExists = await this.prismaService.projects.findFirst({
      where: {
        name: body.name,
        userId: userId,
        organizationId: body.organizationId,
      },
    });
    if (isProjectExists) {
      throw new BadRequestException(`Проект з іменем ${body.name} вже існує`);
    }
    const org = await this.prismaService.organization.findUnique({
      where: {
        id: body.organizationId,
      },
    });
    if (org.userId !== userId) {
      throw new BadRequestException('Тільки власник може створювати проекти');
    }
    const project = await this.prismaService.projects.create({
      data: {
        name: body.name,
        userId: userId,
        organizationId: body.organizationId,
      },
    });
    await this.prismaService.projectMembers.create({
      data: {
        userId: userId,
        projectId: project.id,
      },
    });
    return project;
  }

  async deleteUserFromProject(userId: number, body: RemoveProjectMemberDto) {
    const isProjectExists = await this.prismaService.projects.findFirst({
      where: {
        id: body.projectId,
        userId: userId,
      },
    });
    if (!isProjectExists) {
      throw new BadRequestException(
        `Тільки власник може редагувати користувачів`,
      );
    }

    await this.prismaService.projectMembers.deleteMany({
      where: {
        userId: body.userId,
        projectId: body.projectId,
      },
    });

    await this.prismaService.bugs.updateMany({
      where: {
        id: body.projectId,
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
  async renameProject(userId: number, body: RenameProjectDto) {
    const isProjectExists = await this.prismaService.projects.findFirst({
      where: {
        id: body.id,
        userId: userId,
      },
    });
    if (!isProjectExists) {
      throw new BadRequestException(`No project with ${body.id}`);
    }
    if (isProjectExists.name === body.name) {
      throw new BadRequestException(`Старе і нове ім'я не можуть співпадати`);
    }
    const isNameDuplicates = await this.prismaService.projects.findFirst({
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
      throw new BadRequestException(`Проект з іменем ${body.name} вже існує`);
    }

    return this.prismaService.projects.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
      },
    });
  }

  async getUserProjects(
    userId: number,
    body: GetUserProjectsInOrganizationDto,
  ) {
    return this.prismaService.projectMembers.findMany({
      where: {
        userId: userId,
      },
      include: {
        project: true,
      },
    });
  }

  async deleteProject(userId: number, body: DeleteOrganizationDto) {
    console.log(userId);
    console.log(body.id);
    const isProjectExists = await this.prismaService.projects.findFirst({
      where: {
        id: body.id,
        userId: userId,
      },
    });
    if (!isProjectExists) {
      throw new BadRequestException(`No project with ${body.id}`);
    }

    await this.prismaService.projects.delete({
      where: {
        id: body.id,
        userId: userId,
      },
    });

    return {
      message: 'Project successfully deleted',
    };
  }

  async addUsersToProject(userId: number, body: UsersAndProjectDto) {
    const isPairExists = await this.prismaService.projectMembers.findFirst({
      where: {
        userId: body.userId,
        projectId: body.projectId,
      },
    });
    if (isPairExists) {
      throw new BadRequestException('Користувача вже додано до проекту');
    }
    await this.prismaService.projectMembers.create({
      data: {
        userId: body.userId,
        projectId: body.projectId,
      },
    });
    return {
      message: 'Users successfully added',
    };
  }

  async getProjectUsers(userId: number, body: GetProjectUsers) {
    console.log(userId);
    console.log(body.projectId);
    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: body.projectId,
          userId: userId,
        },
      });
    console.log(isUserProjectMember);

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }

    return this.prismaService.projectMembers.findMany({
      where: {
        projectId: body.projectId,
      },
      include: {
        user: true,
      },
    });
  }

  async getProjectBugs(userId: number, body: GetProjectBugs) {
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

    return this.prismaService.bugs.findMany({
      where: {
        projectId: Number(body.projectId),
      },
      include: {
        assignee: true,
        creator: true,
        project: {
          include: {
            Organization: true,
          },
        },
      },
    });
  }
}
