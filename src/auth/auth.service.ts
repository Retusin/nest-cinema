import { BadRequestException, Injectable } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcryptjs';
import { PrismaService } from './../prisma.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToket.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private readonly JWTService: JwtService) {}

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });
    if (!user) throw new ForbiddenException('Access denied');
    const passwordMatches = await compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access denied');
    const tokens = await this.issueTokenPair(String(user.id));
    return {
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      ...tokens
    };
  }

  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in');

    const result = await this.JWTService.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique(result.id);

    const tokens = await this.issueTokenPair(String(user.id));

    return {
      user: {
        id: user.id,
        email: user.email
      },
      ...tokens
    };
  }

  async register(dto: AuthDto) {
    const oldUser = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (oldUser) throw new BadRequestException('User with this email is already in the system');
    const salt = await genSalt(10);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hash(dto.password, salt)
      }
    });
    const tokens = await this.issueTokenPair(String(newUser.id));
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      },
      ...tokens
    };
  }

  async issueTokenPair(userId: string) {
    const data = { id: userId };

    const refreshToken = await this.JWTService.signAsync(data, {
      expiresIn: '15d'
    });

    const accessToken = await this.JWTService.signAsync(data, {
      expiresIn: '1h'
    });

    return { refreshToken, accessToken };
  }
}
