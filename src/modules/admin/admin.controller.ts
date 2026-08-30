import { Controller, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags("Admin Management")
@Controller('admin')
export class AdminController {

  constructor(private readonly adminService: AdminService) {}

}
