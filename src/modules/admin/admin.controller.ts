import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionsEnum } from 'src/common/types/permissions.enum';
import { AddPermissionDto } from './dto/addPermission.dto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { AddRoleDto } from './dto/addRole.dto';
import { GetUsersDto } from './dto/getUsers.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiTags("Admin Management")
@Controller('admin')
export class AdminController {

  constructor(private readonly adminService: AdminService) {}


  @ApiOperation({ summary: "Adding Permission", description: "With this api admin can get the list of permissions" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_READ_PERMISSION)
  @Get("get-permissions")
  async getPermission () {

    return await this.adminService.getPermissionsList();

  }

  @ApiOperation({ summary: "Adding Permission", description: "With this api admin can add a new permission" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ADD_PERMISSION)
  @Post("add-permission")
  async addPermission (@Body() data: AddPermissionDto) {

    return await this.adminService.addPermission(data);

  }

  @ApiOperation({ summary: "Adding Permission", description: "With this api admin can remove a new permission" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_DELETE_PERMISSION)
  @Delete("delete-permission/:permissionId")
  async deletePermission (@Param("permissionId", ParseUUIDPipe) permissionId: string) {

    return await this.adminService.deletePermission(permissionId);

  }

  @ApiOperation({ summary: "Adding Role", description: "With this api admin can add a new Role" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ADD_ROLE)
  @Post("add-role")
  async addRole (@Body() data: AddRoleDto) {

    return await this.adminService.addRole(data);

  }

  @ApiOperation({ summary: "Get Users", description: "With this api admin can get users list" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_GET_USERS)
  @Get("users")
  async getUsers (@Query() query: GetUsersDto) {

    return await this.adminService.getUsers(query);

  }

}
