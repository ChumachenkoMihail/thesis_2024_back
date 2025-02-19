import {
  Body,
  Controller,
  Post,
  Req,
  Request,
  Get,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { CurrentUser } from './decorators/user.decorator';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { TokensDto } from './dto/tokens.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiResponse({
    status: 400,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Password is too weak',
  })
  @ApiOperation({ summary: 'Registration' })
  register(@Req() req: Request, @Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('/me')
  @UseGuards(AccessTokenGuard)
  async me(@CurrentUser('userId') userId: number) {
    return this.authService.me(userId);
  }

  @Post('/login')
  @ApiResponse({
    status: 400,
    description: 'User does not exist',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid password',
  })
  @ApiOperation({ summary: 'Login' })
  login(@Req() req: Request, @Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  @ApiResponse({
    status: 200,
    description: 'Tokens',
    type: TokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Access Denied',
  })
  @ApiOperation({ summary: 'Refresh access token via refresh' })
  refresh(
    @Req() req,
    @CurrentUser('userId') id: number,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(id, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  @ApiResponse({
    status: 200,
    description: 'Logged out',
    schema: { example: { message: 'Logged out' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiOperation({ summary: 'Log out' })
  async logout(
    @Req() req,
    @Res() res: Response,
    @CurrentUser('userId') id: number,
  ) {
    await this.authService.logout(id);
    res.status(HttpStatus.OK).json({ message: 'Logged out' });
  }

  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed',
    schema: { example: { message: 'Password changed' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid operation',
  })
  @ApiResponse({
    status: 400,
    description: 'Password is too weak',
  })
  @ApiOperation({ summary: 'Change password' })
  @UseGuards(AccessTokenGuard)
  @Post('/change-password')
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ChangePasswordDto,
    @CurrentUser('userId') id: number,
  ) {
    await this.authService.changePassword(id, body.newPassword);
    res.status(HttpStatus.OK).json({ message: 'Password changed' });
  }
}
