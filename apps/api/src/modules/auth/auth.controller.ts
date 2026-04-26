import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { type AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('status')
  getStatus() {
    return this.authService.getStatus();
  }

  @Public()
  @RateLimit({ limit: 10, windowMs: 60_000 })
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ipAddress = req.ip ?? req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Public()
  @Post('register')
  register(@Body() _dto: RegisterDto) {
    return {
      message:
        'Registro publico deshabilitado. Usa /v1/setup/initialize para primera instalacion o el flujo administrativo autenticado.',
    };
  }

  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user);
  }

  @Post('logout')
  logout(
    @Body() dto: LogoutDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.authService.logout(dto, req.user);
  }

  @Public()
  @RateLimit({ limit: 20, windowMs: 60_000 })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
