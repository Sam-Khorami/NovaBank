import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { OtpVerificationDto } from './dto/otpVerification.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags("Auth Management")
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}


  @ApiOperation({ summary: "Sign Up", description: "With this api you can sign up" })
  @Post("signup")
  async signUp (@Body() data: SignUpDto) {

    return await this.authService.signUp(data);

  }

  @ApiOperation({ summary: "Login", description: "With this api you can login" })
  @Post("login")
  async login (@Body() data: LoginDto) {

    return await this.authService.login(data);

  }

  @ApiOperation({ summary: "Logout", description: "With this api you can logout" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("logout")
  async logout (@Res({ passthrough: true }) response: Response) {

    return await this.authService.logout(response);

  }

  @ApiOperation({ summary: "Verify Otp", description: "With this api you can verify your otp code" })
  @Post("verify-otp")
  async otpVerification (@Body() data: OtpVerificationDto, @Res({ passthrough: true }) response: Response) {

    return await this.authService.otpVerification(data, response);

  }

  @ApiOperation({ summary: "Change Password", description: "With this api you can change your password" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("change-password")
  async changePassword (@Body() data: ChangePasswordDto, @Req() request: Request) {

    return await this.authService.changePassword(data, request);

  }

}
