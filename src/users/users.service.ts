import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(login: string) {
    return this.prismaService.user.findFirst({
      where: {
        login: login,
      },
    });
  }

  async findUserById(id: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  async createUser(hashedPassword, firstName, lastName, login, position) {
    return this.prismaService.user.create({
      //@ts-ignore
      data: {
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        login: login,
        position: position,
      },
    });
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    return this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }

  async changePassword(userId: number, newPassword: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
  }
}
