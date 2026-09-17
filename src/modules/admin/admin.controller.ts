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


  @ApiOperation({ summary: "Getting Permission", description: "With this api admin can get the list of permissions" })
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

  @ApiOperation({ summary: "Deleting Permission", description: "With this api admin can remove a permission" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_DELETE_PERMISSION)
  @Delete("delete-permission/:permissionId")
  async deletePermission (@Param("permissionId", ParseUUIDPipe) permissionId: string) {

    return await this.adminService.deletePermission(permissionId);

  }

  @ApiOperation({ summary: "Getting Roles", description: "With this api admin can get the list of roles" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_READ_ROLE)
  @Get("get-roles")
  async getRoles () {

    return await this.adminService.getRolesList();

  }

  @ApiOperation({ summary: "Adding Role", description: "With this api admin can add a new Role" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ADD_ROLE)
  @Post("add-role")
  async addRole (@Body() data: AddRoleDto) {

    return await this.adminService.addRole(data);

  }

  @ApiOperation({ summary: "Deleting Role", description: "With this api admin can remove a role" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_DELETE_ROLE)
  @Delete("delete-role/:roleId")
  async deleteRole (@Param("roleId", ParseUUIDPipe) roleId: string) {

    return await this.adminService.deleteRole(roleId);

  }

  @ApiOperation({ summary: "Assigning Role", description: "With this api admin can assign a role" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ASSIGN_ROLE)
  @Post("assign-role/:userId/:roleId")
  async assignRole (@Param("userId", ParseUUIDPipe) userId: string, @Param("roleId", ParseUUIDPipe) roleId: string) {

    return await this.adminService.assignRole(userId, roleId);

  }

  @ApiOperation({ summary: "Assigning Permission To User", description: "With this api admin can assign a permission to users" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ASSIGN_PERMISSION)
  @Post("assign-permission-to-user/:userId/:permissionId")
  async assignPermissionToUser (@Param("userId", ParseUUIDPipe) userId: string, @Param("permissionId", ParseUUIDPipe) permissionId: string) {

    return await this.adminService.assignPermissionToUser(userId, permissionId);

  }

  @ApiOperation({ summary: "Getting User Permissions", description: "With this api admin can get user's permissions" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_READ_PERMISSION)
  @Get("permissions/:userId")
  async getUserPermissions (@Param("userId", ParseUUIDPipe) userId: string) {

    return await this.adminService.getUserPermissions(userId);

  }

  @ApiOperation({ summary: "Assigning Permission To Role", description: "With this api admin can assign a permission to roles" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_ASSIGN_PERMISSION)
  @Post("assign-permission-to-role/:permissionId/:roleId")
  async assignPermissionToRole (@Param("permissionId", ParseUUIDPipe) permissionId: string, @Param("roleId", ParseUUIDPipe) roleId: string, ) {

    return await this.adminService.assignPermissionToRole(permissionId, roleId);

  }

  @ApiOperation({ summary: "Get Users", description: "With this api admin can get users list" })
  @Permissions(PermissionsEnum.ADMIN_ACCESS_GET_USERS)
  @Get("users")
  async getUsers (@Query() query: GetUsersDto) {

    return await this.adminService.getUsers(query);

  }

}
