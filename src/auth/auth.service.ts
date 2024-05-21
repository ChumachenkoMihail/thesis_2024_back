import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { compare, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
import * as process from 'process';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(user: RegisterDto) {
    //check if user exists
    const userExists = await this.usersService.findUserByEmail(user.email);
    if (userExists) {
      throw new BadRequestException('Користувач з таким логіном вже існує');
    }
    // check password strong
    if (user.password.length < 6) {
      throw new BadRequestException('Пароль має містити більше 6 символів');
    }

    //hash password
    const hashedPassword = await hashSync(user.password, 10);
    //create new user
    const newUser = await this.usersService.createUser(
      hashedPassword,
      user.firstName,
      user.lastName,
      user.email,
      user.position,
    );
    // get access & refresh tokens
    const tokens = await this.getTokens(newUser.id, newUser.login);
    // set users refresh token
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    // return tokens & registration status
    return {
      userId: newUser.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    //check if user exists
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Користувача з таким логіном не існує');
    }
    // check is passwords equal
    console.log(loginDto.password, user.password);
    const isPasswordEqual = await compare(loginDto.password, user.password);
    if (!isPasswordEqual) {
      throw new BadRequestException('Невірний пароль');
    }

    // generate new tokens
    const tokens = await this.getTokens(user.id, user.login);
    // update user refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    // return tokens & registration status
    return {
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number) {
    // delete users refresh token
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out' };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    return await this.usersService.updateRefreshToken(userId, refreshToken);
  }

  async getTokens(userId: number, email: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        userId,
        email,
      },
      {
        secret: process.env.ACCESS_SECRET_KEY,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      },
    );

    // create refresh token
    const refreshToken = await this.jwtService.signAsync(
      {
        userId,
        email,
      },
      {
        secret: process.env.REFRESH_SECRET_KEY,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // check if user exist & has refresh
    const user = await this.usersService.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw new BadRequestException('Access Denied');
    }
    // get new tokens
    const tokens = await this.getTokens(user.id, user.login);
    // update users refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async changePassword(userId: number, newPassword: string) {
    // check if user exists
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordEqual = await compare(newPassword, user.password);
    if (isPasswordEqual) {
      throw new BadRequestException('Invalid operation');
    }
    // check password strong
    if (newPassword.length < 8) {
      throw new BadRequestException('Password is too weak');
    }

    const hashedPassword = await hashSync(newPassword, 10);
    await this.usersService.changePassword(userId, hashedPassword);
  }

  async me(userId: number) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
