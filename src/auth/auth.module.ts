import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import {UsersModule} from "../users/users.module";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersModule,
    PrismaModule,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  imports: [
    JwtModule.register({}),
    UsersModule,
  ],
})
export class AuthModule {}
