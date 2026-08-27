import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';

@ApiTags("Auth Management")
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}


  @Post("signup")
  async signUp (@Body() data: SignUpDto) {

    return await this.authService.signUp(data);

  }

}
