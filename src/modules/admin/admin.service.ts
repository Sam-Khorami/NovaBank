import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AddPermissionDto } from './dto/addPermission.dto';
import { Permission } from 'src/entity/permission.entity';
import { AddRoleDto } from './dto/addRole.dto';
import { Role } from 'src/entity/role.entity';
import { GetUsersDto } from './dto/getUsers.dto';

@Injectable()
export class AdminService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>

    ) {}

    async getPermissionsList () {

        const permissions = await this.permissionRepo.find();
        if (!permissions || Object.keys(permissions).length === 0) throw new NotFoundException("The permissions not found!");

        return { permissions }

    }

    async addPermission (data: AddPermissionDto) {

        const permission = await this.permissionRepo.findOne({ where: { name: data.permission } });
        if (permission) throw new ConflictException("The entered permission already exists!");

        const newPermission = this.permissionRepo.create({ name: data.permission });
        await this.permissionRepo.save(newPermission);
        return { message: "The permission addded successfully!" }

    }

    async deletePermission (permissionId: string) {

        const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
        if (!permission || Object.keys(permission).length === 0) throw new NotFoundException("The permission not found!");

        await this.permissionRepo.remove(permission);
        return { message: "The entered permission removed successfully!" }

    }

    async getRolesList () {

        const roles = await this.roleRepo.find();
        if (!roles || Object.keys(roles).length === 0) throw new NotFoundException("The role not found!");

        return { roles }

    }

    async addRole (data: AddRoleDto) {

        const role = await this.roleRepo.findOne({ where: { name: data.role } });
        if (role) throw new ConflictException("The entered role already exists!");

        const newRole = this.roleRepo.create({ name: data.role });
        await this.roleRepo.save(newRole);
        return { message: "The role addded successfully!" }

    }

    // async deleteRole (roleId: string) {

    //     const role = await this.roleRepo.findOne({ where: { id: roleId } });
    //     if (!role || Object.keys(role).length === 0) throw new NotFoundException("The role not found!");

    //     await this.roleRepo.remove(role);
    //     return { message: "The entered role removed successfully!" }

    // }

    async getUsers (query: GetUsersDto) {

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<User> = {};

        if (query.phoneNumber) where.phoneNumber = query.phoneNumber;
        if (query.nationalCode) where.nationalCode = query.nationalCode;
        if (query.role) where.role = query.role;
        if (query.userVerification) where.userVerification = query.userVerification;
        if (query.emailVerification) where.emailVerification = query.emailVerification;

        const [users, total] = await this.userRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });

        const totalPages = Math.ceil(total / query.limit);
        return { data: users , pagination: { page: query.page, limit: query.limit, total, totalPages } }

    }

    async getPermissions (userId: string) {

        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { permissions: true, roles: { permissions: true } } });
        if (!user) throw new NotFoundException("User Not Found!");

        const permissions = new Set<string>();

        user.permissions.forEach((item) => {

            permissions.add(item.name);

        });

        user.roles.forEach((item) => {

            item.permissions.forEach((permission) => {

                permissions.add(permission.name);

            })

        });

        return Array.from(permissions);

    }

}
