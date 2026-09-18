import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AddPermissionDto } from './dto/addPermission.dto';
import { Permission } from 'src/entity/permission.entity';
import { AddRoleDto } from './dto/addRole.dto';
import { Role } from 'src/entity/role.entity';
import { GetUsersDto } from './dto/getUsers.dto';
import { Documents } from 'src/entity/documents.entity';
import { DocumentStatusEnum, KycStatusEnum } from 'src/common/types/entities.enum';
import { GetUserKycStatusDto } from './dto/getUserKycStatus.dto';

@Injectable()
export class AdminService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>,
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

    async deleteRole (roleId: string) {

        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role || Object.keys(role).length === 0) throw new NotFoundException("The role not found!");

        await this.roleRepo.remove(role);
        return { message: "The entered role removed successfully!" }

    }

    async assignRole (userId: string, roleId: string) {

        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { roles: true } });
        if (!user) throw new NotFoundException("The user not found!");

        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role) throw new NotFoundException("The role not found!");

        user.roles.forEach((item) => {

            if (item.name === role.name) throw new BadRequestException("The user already has this role!");

        })

        user.roles = [];
        user.roles.push(role);
        user.role = role.name;
        await this.userRepo.save(user);

        return { message: "The entered role assigned" }

    }

    async assignPermissionToUser (userId: string, permissionId: string) {

        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { permissions: true } });
        if (!user) throw new NotFoundException("The user not found!");

        const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
        if (!permission) throw new NotFoundException("The permission not found!");

        user.permissions.forEach((item) => {

            if (item.name === permission.name) throw new BadRequestException("The user already has that permission");

        })

        user.permissions.push(permission);
        await this.userRepo.save(user);
        return { message: "The permission assigned" }

    }

    async getUserPermissions (userId: string) {

        const permissions = new Set<string>();

        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { permissions: true, roles: { permissions: true } } });
        if (!user) throw new NotFoundException("The user not found!");

        user.permissions.forEach((permission) => {

            permissions.add(permission.name);

        })

        user.roles.forEach((role) => {

            role.permissions.forEach((permission) => {

                permissions.add(permission.name);

            })

        })

        const permissionArray = Array.from(permissions);
        return { permissionArray }

    }

    async assignPermissionToRole (permissionId: string, roleId: string) {

        const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
        if (!permission) throw new NotFoundException("The permission not found!");

        const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: { permissions: true } });
        if (!role) throw new NotFoundException("The role not found!");

        role.permissions.forEach((item) => {

            if (item.name === permission.name) throw new BadRequestException("The permission already assigned for this role!");

        })

        role.permissions.push(permission);
        await this.roleRepo.save(role);
        return { message: "The permission assigned to this role" }

    }

    async getRolePermissions (roleId: string) {

        const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: { permissions: true } });
        if (!role) throw new NotFoundException("The role not found!");

        const rolePermissions = role.permissions;
        return { rolePermissions }

    }

    async revokePermissionFromUser (userId: string, permissionId: string) {

        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { permissions: true } });
        if (!user) throw new NotFoundException("The user not found!");

        const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
        if (!permission) throw new NotFoundException("The permission not found!");

        const checkUserPermission = user.permissions.some((item) => { return item.name === permission.name })
        if (!checkUserPermission) throw new BadRequestException("The permission does not exist");

        user.permissions = user.permissions.filter((item) => item.name !== permission.name);
        await this.userRepo.save(user);

        return { message: "The permission was revoked from user" }

    }

    async revokePermissionFromRole (roleId: string, permissionId: string) {

        const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: { permissions: true } });
        if (!role) throw new NotFoundException("The role not found!");

        const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
        if (!permission) throw new NotFoundException("The permission not found!");

        const checkRolePermission = role.permissions.some((item) => { return item.name === permission.name })
        if (!checkRolePermission) throw new BadRequestException("The permission does not exist");

        role.permissions = role.permissions.filter((item) => item.name !== permission.name);
        await this.roleRepo.save(role);

        return { message: "The permission was revoked from user" }

    }

    async getUserKycStatus (query: GetUserKycStatusDto) {

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<User> = {};

        if (query.status) where.kycStatus = query.status;
        const [statuses, total] = await this.userRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });

        return { data: statuses , pagination: { page: query.page, limit: query.limit, total } }

    }

    async acceptKyc (documentId: string) {

        const document = await this.documentsRepo.findOne({ where: { id: documentId } });
        if (!document) throw new NotFoundException("The document not found");

        const user = await this.userRepo.findOne({ where: { id: document.userId } });
        if (!user) throw new NotFoundException("The user not found!");

        if (document.status === DocumentStatusEnum.APPROVED && user.kycStatus === KycStatusEnum.APPROVED) throw new BadRequestException("The document approved already!");
        if (document.status !== DocumentStatusEnum.PENDING && user.kycStatus !== KycStatusEnum.UNDER_REVIEW) throw new BadRequestException("The document status set already");
        
        document.status = DocumentStatusEnum.APPROVED;
        user.kycStatus = KycStatusEnum.APPROVED;

        await this.documentsRepo.save(document);
        await this.userRepo.save(user);

        return { message: "The document approved successfully" }

    }

    async rejectKyc (documentId: string) {

        const document = await this.documentsRepo.findOne({ where: { id: documentId } });
        if (!document) throw new NotFoundException("The document not found");

        const user = await this.userRepo.findOne({ where: { id: document.userId } });
        if (!user) throw new NotFoundException("The user not found!");

        if (document.status === DocumentStatusEnum.REJECTED && user.kycStatus === KycStatusEnum.REJECTED) throw new BadRequestException("The document rejected already!");
        if (document.status !== DocumentStatusEnum.PENDING && user.kycStatus !== KycStatusEnum.UNDER_REVIEW) throw new BadRequestException("The document status set already");
        
        document.status = DocumentStatusEnum.REJECTED;
        user.kycStatus = KycStatusEnum.REJECTED;

        await this.documentsRepo.save(document);
        await this.userRepo.save(user);

        return { message: "The document rejected successfully" }

    }

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
