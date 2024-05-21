import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import {
  CreateBugDto,
  DeleteBugAttachmentDto,
  DeleteBugDto,
  DownloadAttachmentDto,
  GetBug,
  UpdateBugDto,
} from './dto/bugs.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('bugs')
@ApiTags('bugs')
@ApiBearerAuth()
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post('create-bug')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async createBug(
    @Body() body: CreateBugDto,
    @CurrentUser('userId') userId: number,
    @UploadedFiles() files,
  ) {
    console.log(files);
    if (!body.projectId || !body.title) {
      throw new BadRequestException('No projectId or title');
    }
    return await this.bugsService.createBug(userId, body, files);
  }

  @Post('update-bug')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async updateBug(
    @Body() body: UpdateBugDto,
    @CurrentUser('userId') userId: number,
    @UploadedFiles() files,
  ) {
    if (!body.bugId || !body.title) {
      throw new BadRequestException('No projectId or title');
    }
    return await this.bugsService.updateBug(userId, body, files);
  }

  @Post('delete-bug')
  @UseGuards(AccessTokenGuard)
  async deleteBug(
    @Body() body: DeleteBugDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.bugsService.deleteBug(userId, body);
  }

  @Post('delete-bug-attachment')
  @UseGuards(AccessTokenGuard)
  async deleteBugAttachment(
    @Body() body: DeleteBugAttachmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.bugsService.deleteBugAttachment(userId, body);
  }

  @Get('get-bug/:bugId')
  @UseGuards(AccessTokenGuard)
  async getBugWIthAttachments(
    @Param('bugId') bugId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return await this.bugsService.getBug(userId, { bugId });
  }

  @Post('download-attachment')
  @UseGuards(AccessTokenGuard)
  async test(
    @Body() body: DownloadAttachmentDto,
    @CurrentUser('userId') userId: number,
  ) {
    const url = await this.bugsService.downloadAttachment(userId, body);
    console.log(url);
    return { url: url };
  }
}
