import { Controller, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';

@ApiTags("Users Managment")
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
