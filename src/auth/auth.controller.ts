import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Public } from 'src/user/public.decorator';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToket.dto';

dotenv.config();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/register')
  create(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/login/access-token')
  getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.getNewTokens(dto);
  }

  @Public()
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('/login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
