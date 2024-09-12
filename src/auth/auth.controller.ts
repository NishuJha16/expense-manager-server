import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user and return JWT token' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in and token generated.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  //   @Post('logout')
  //   @ApiOperation({ summary: 'Logout the currently logged-in user' })
  //   @ApiBearerAuth()
  //   @UseGuards(JwtAuthGuard)
  //   @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  //   @ApiResponse({ status: 401, description: 'Unauthorized.' })
  //   async logout(@Req() req: any): Promise<void> {
  //     await this.authService.logout(req.user.id);
  //   }
}
