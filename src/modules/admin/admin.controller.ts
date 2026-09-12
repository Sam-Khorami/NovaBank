import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionsEnum } from 'src/common/types/permissions.enum';
import { AddPermissionDto } from './dto/addPermission.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags("Admin Management")
@Controller('admin')
export class AdminController {

  constructor(private readonly adminService: AdminService) {}


  @ApiOperation({ summary: "Adding Permission", description: "With this api admin can add a new permission" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ADD_PERMISSION)
  @Post("add-permission")
  async addPermission (@Body() data: AddPermissionDto, @Req() request: Request) {

    console.log(request["user"]);
    return await this.adminService.addPermission(data);

  }

}
