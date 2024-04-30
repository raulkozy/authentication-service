import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { getClientIp } from '@util/request-ip';
import { request } from 'http';
import { CommonHeadersDTO } from 'src/common/dto/headers.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { LoginDTO, TokenDTO } from '../model/dto/auth.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Customer')
  @Post('/login')
  login(
    @Headers() headers: CommonHeadersDTO,
    @Body() loginDTO: LoginDTO,
    @Request() request,
  ): Promise<TokenDTO> {
    const location = getClientIp(request);
    return this.authService.login(loginDTO, headers, location);
  }

  @ApiTags('Customer')
  @Get('refresh-token')
  refreshToken(
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<TokenDTO> {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiTags('Customer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Post('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user.customer_id);
  }

  @ApiTags('Admin')
  @Post('/admin/login')
  adminUserLogin(
    @Headers() headers: CommonHeadersDTO,
    @Body() loginDTO: LoginDTO,
  ): Promise<TokenDTO> {
    const location = getClientIp(request);
    return this.authService.adminUserLogin(loginDTO, headers, location);
  }

  @ApiTags('Admin')
  @Get('/admin/refresh-token')
  adminUserRefreshToken(
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<TokenDTO> {
    return this.authService.adminUserRefreshToken(refreshToken);
  }

  @ApiTags('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Authorization')
  @Post('/admin/logout')
  adminUserLogout(@Request() req) {
    return this.authService.logout(req.user.user_id);
  }
}
