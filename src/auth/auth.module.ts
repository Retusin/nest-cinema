import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { PrismaService } from './../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SEKRET
    }),
    ConfigModule
  ],

  controllers: [AuthController],
  providers: [AuthService, PrismaService, AtStrategy, RtStrategy]
})
export class AuthModule {}
