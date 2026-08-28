import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { OtpVerificationDto } from './dto/otpVerification.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { VerifyChangePasswordDto } from './dto/verifyChangePassword.dto';

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

  @ApiOperation({ summary: "Forget Password", description: "With this api you can set a new password in case you forget your password" })
  @Post("forget-password")
  async forgetPassword (@Body() data: ForgetPasswordDto) {

    return await this.authService.forgetPassword(data);

  }

  @ApiOperation({ summary: "Verify Otp For Forget Password", description: "With this api you can enter the otp code that sent to your email and set your new password" })
  @Post("verify-otp-for-forget-password")
  async verifyOtpForChangePassword (@Body() data: VerifyChangePasswordDto) {

    return await this.authService.verifyOtpForChangePassword(data);

  }

}
