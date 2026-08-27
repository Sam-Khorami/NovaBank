import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { OtpVerificationDto } from './dto/otpVerification.dto';
import type { Response } from 'express';

@ApiTags("Auth Management")
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}


  @Post("signup")
  async signUp (@Body() data: SignUpDto) {

    return await this.authService.signUp(data);

  }

  @Post("verify-otp")
  async otpVerification (@Body() data: OtpVerificationDto, @Res({ passthrough: true }) response: Response) {

    return await this.authService.otpVerification(data, response);

  }

}
