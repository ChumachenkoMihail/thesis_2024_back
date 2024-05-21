import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AddCommentDto, DeleteComment } from './dto/comments.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('comments')
@ApiTags('comments')
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('add-comment')
  @UseGuards(AccessTokenGuard)
  async addComment(
    @Body() body: AddCommentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.commentsService.addComment(userId, body);
  }

  @Post('delete-comment')
  @UseGuards(AccessTokenGuard)
  async deleteComment(
    @Body() body: DeleteComment,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.commentsService.deleteComment(userId, body);
  }
}
