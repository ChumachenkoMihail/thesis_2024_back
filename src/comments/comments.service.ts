import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCommentDto, DeleteComment } from './dto/comments.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async addComment(userId: number, body: AddCommentDto) {
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

    const comment = await this.prismaService.comments.create({
      data: {
        text: body.text,
        createdById: userId,
        bugId: bug.id,
      },
    });

    if (
      bug.assigneeUserId &&
      body.notifyAssignee &&
      bug.assigneeUserId !== userId
    ) {
      const commenter = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      await this.prismaService.notifications.create({
        data: {
          fromUserId: userId,
          toUserId: bug.assigneeUserId,
          status: 'UNREAD',
          text: `${commenter.firstName} ${commenter.lastName} left a comment on a bug #${bug.id} ${bug.title}`,
        },
      });
    }
  }

  async deleteComment(userId: number, body: DeleteComment) {
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

    const commentToDelete = await this.prismaService.comments.findUnique({
      where: {
        bugId: body.bugId,
        id: body.commentId,
      },
    });
    if (!commentToDelete) {
      throw new BadRequestException(`No comment with id ${body.commentId}`);
    }

    await this.prismaService.comments.delete({
      where: {
        id: commentToDelete.id,
      },
    });

    return {
      message: 'Comment successfully deleted',
    };
  }
}
