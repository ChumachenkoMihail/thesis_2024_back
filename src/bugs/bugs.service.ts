import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateBugDto,
  DeleteBugAttachmentDto,
  DeleteBugDto,
  DownloadAttachmentDto,
  GetBug,
  UpdateBugDto,
} from './dto/bugs.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BugsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioClientService: MinioClientService,
    private readonly configService: ConfigService,
  ) {}

  async createBug(userId: number, body: CreateBugDto, files: Array<any>) {
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
    const createdBug = await this.prismaService.bugs.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        status: body.status,
        creatorUserId: userId,
        assigneeUserId: Number(body.assigneeId),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        platform: body.platform,
        environmentId: body.environmentId,
        testAsText: body.testAsText,
        codeAsText: body.codeAsText,
        priority: Number(body.priority),
        os: body.os,
        realize: body.realize,
        title: body.title,
        description: body.description,
        projectId: Number(body.projectId),
      },
    });
    files?.map(async (file) => {
      const updatedFileName = file.originalname.replace(
        /\.([^\.]+)$/,
        `_${uuidv4()}.$1`,
      );
      const savedFile = await this.minioClientService.saveFile(
        this.configService.get('BUG_ATTACHMENTS_BUCKET_NAME'),
        updatedFileName,
        files[0].buffer,
      );
      if (file.fieldname === 'code') {
        await this.prismaService.bugsAttachments.create({
          data: {
            bugId: createdBug.id,
            attachmentName: updatedFileName,
            attachmentType: 'CODE',
          },
        });
      }
      if (file.fieldname === 'test') {
        await this.prismaService.bugsAttachments.create({
          data: {
            bugId: createdBug.id,
            attachmentName: updatedFileName,
            attachmentType: 'TEST',
          },
        });
      }
      if (file.fieldname !== 'test' && file.fieldname !== 'code') {
        await this.prismaService.bugsAttachments.create({
          data: {
            bugId: createdBug.id,
            attachmentName: updatedFileName,
            attachmentType: 'OTHER',
          },
        });
      }
    });

    if (body.assigneeId && body.assigneeId !== userId) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      await this.prismaService.notifications.create({
        data: {
          fromUserId: userId,
          toUserId: Number(body.assigneeId),
          text: `${user.firstName} ${user.lastName} assigned to you new bug #${createdBug.id} ${createdBug.title}`,
          bugId: createdBug.id,
          content: 'TEXT',
          valid: true,
          status: 'UNREAD',
        },
      });
    }

    return createdBug;
  }

  async updateBug(userId: number, body: UpdateBugDto, files: Array<any>) {
    console.log('body.status');
    console.log(body.status);
    console.log(typeof body.status);
    const bug = await this.prismaService.bugs.findUnique({
      where: {
        id: Number(body.bugId),
      },
    });
    if (!bug) {
      throw new BadRequestException(`No bug with id ${Number(body.bugId)}`);
    }

    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(bug.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }
    const updatedBug = await this.prismaService.bugs.update({
      where: {
        id: Number(body.bugId),
      },
      data: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        status: body.status !== 'null' ? body.status : null,
        assigneeUserId: Number(body.assigneeId),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        platform: body.platform !== 'null' ? body.platform : null,
        priority: Number(body.priority),
        // environmentId: body.environmentId ? body.environmentId : null,
        os: body.os,
        testAsText: body.testAsText,
        codeAsText: body.codeAsText,
        realize: body.realize,
        title: body.title,
        description: body.description,
      },
    });
    if (files) {
      files.map(async (file) => {
        const updatedFileName = file.originalname.replace(
          /\.([^\.]+)$/,
          `_${uuidv4()}.$1`,
        );
        const savedFile = await this.minioClientService.saveFile(
          this.configService.get('BUG_ATTACHMENTS_BUCKET_NAME'),
          updatedFileName,
          files[0].buffer,
        );

        if (file.fieldname === 'code') {
          await this.prismaService.bugsAttachments.create({
            data: {
              bugId: updatedBug.id,
              attachmentName: updatedFileName,
              attachmentType: 'CODE',
            },
          });
        }
        if (file.fieldname === 'test') {
          await this.prismaService.bugsAttachments.create({
            data: {
              bugId: updatedBug.id,
              attachmentName: updatedFileName,
              attachmentType: 'TEST',
            },
          });
        }
        if (file.fieldname !== 'test' && file.fieldname !== 'code') {
          await this.prismaService.bugsAttachments.create({
            data: {
              bugId: updatedBug.id,
              attachmentName: updatedFileName,
              attachmentType: 'OTHER',
            },
          });
        }
      });
    }

    if (
      body.assigneeId &&
      body.assigneeId !== userId &&
      bug?.assigneeUserId !== body.assigneeId
    ) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (
        body.assigneeId &&
        bug.assigneeUserId !== updatedBug.assigneeUserId &&
        body.assigneeId !== userId
      ) {
        await this.prismaService.notifications.create({
          data: {
            fromUserId: userId,
            toUserId: Number(body.assigneeId),
            text: `${user.firstName} ${user.lastName} assigned to you a bug #${updatedBug.id} ${updatedBug.title}`,
            bugId: updatedBug.id,
            content: 'TEXT',
            valid: true,
            status: 'UNREAD',
          },
        });
      }
    } else {
      if (
        bug.status !== body.status &&
        bug.assigneeUserId! == updatedBug.assigneeUserId &&
        body.assigneeId
      ) {
        const user = await this.prismaService.user.findUnique({
          where: {
            id: userId,
          },
        });
        await this.prismaService.notifications.create({
          data: {
            fromUserId: userId,
            toUserId: Number(body.assigneeId),
            text: `${user.firstName} ${user.lastName} changed bug #${updatedBug.id} ${updatedBug.title} status to ${body.status}`,
            bugId: updatedBug.id,
            content: 'TEXT',
            valid: true,
            status: 'UNREAD',
          },
        });
      }
    }

    return updatedBug;
  }

  async deleteBug(userId: number, body: DeleteBugDto) {
    console.log(body.bugId);
    const bug = await this.prismaService.bugs.findUnique({
      where: {
        id: Number(body.bugId),
      },
    });
    if (!bug) {
      throw new BadRequestException(`No bug with id ${body.bugId}`);
    }

    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(bug.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }
    await this.prismaService.bugs.delete({
      where: {
        id: Number(body.bugId),
      },
    });

    return {
      message: 'Bug successfully deleted',
    };
  }

  async deleteBugAttachment(userId: number, body: DeleteBugAttachmentDto) {
    const bugAttachment = await this.prismaService.bugsAttachments.findUnique({
      where: {
        id: Number(body.attachmentId),
        bugId: Number(body.bugId),
      },
      include: {
        bug: true,
      },
    });
    if (!bugAttachment) {
      throw new BadRequestException(
        `No bug attachment with id ${body.attachmentId}`,
      );
    }

    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(bugAttachment.bug.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }

    await this.prismaService.bugsAttachments.delete({
      where: {
        id: bugAttachment.id,
      },
    });
    return {
      message: 'Attachment successfully deleted',
    };
  }

  async getBug(userId: number, body: GetBug) {
    const bug = await this.prismaService.bugs.findUnique({
      where: {
        id: Number(body.bugId),
      },
      include: {
        BugsAttachments: true,
        Comments: {
          include: {
            createdBy: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        environment: true,
        project: true,
        assignee: true,
        creator: true,
      },
    });
    if (!bug) {
      throw new BadRequestException(`No bug with id ${body.bugId}`);
    }

    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(bug.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }
    return bug;
  }

  async downloadAttachment(userId: number, body: DownloadAttachmentDto) {
    const bug = await this.prismaService.bugs.findUnique({
      where: {
        id: body.bugId,
      },
      include: {
        BugsAttachments: true,
      },
    });
    if (!bug) {
      throw new BadRequestException(`No bug with id ${body.bugId}`);
    }

    const isUserProjectMember =
      await this.prismaService.projectMembers.findFirst({
        where: {
          projectId: Number(bug.projectId),
          userId: userId,
        },
      });

    if (!isUserProjectMember) {
      throw new BadRequestException('You are not member of this project');
    }
    const attachment = await this.prismaService.bugsAttachments.findUnique({
      where: {
        bugId: bug.id,
        id: body.attachmentId,
      },
    });
    return await this.minioClientService.getAttachmentLink(
      this.configService.get('BUG_ATTACHMENTS_BUCKET_NAME'),
      attachment.attachmentName,
    );
  }
}
