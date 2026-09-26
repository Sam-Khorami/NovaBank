import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { AddPermissionDto } from './dto/addPermission.dto';
import { Permission } from 'src/entity/permission.entity';
import { AddRoleDto } from './dto/addRole.dto';
import { Role } from 'src/entity/role.entity';
import { GetUsersDto } from './dto/getUsers.dto';
import { Documents } from 'src/entity/documents.entity';
import { DocumentStatusEnum, KycStatusEnum, WalletStatusEnum } from 'src/common/types/entities.enum';
import { GetUserKycStatusDto } from './dto/getUserKycStatus.dto';
import { GetDocumentStatusDto } from './dto/getDocumentStatus.dto';
import { Wallet } from 'src/entity/wallet.entity';
import { NotficationsService } from '../notfications/notfications.service';
import { VirtualCardService } from '../virtual_card/virtual_card.service';
import crypto from "crypto";

@Injectable()
export class AdminService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        private readonly dataSource: DataSource,
        private readonly virtualCardService: VirtualCardService,
        private readonly notficationService: NotficationsService

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

    async getDocumentStatus (query: GetDocumentStatusDto) {

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<Documents> = {};

        if (query.status) where.status = query.status;
        const [statuses, total] = await this.documentsRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });

        return { data: statuses , pagination: { page: query.page, limit: query.limit, total } }

    }

    async acceptKyc (documentId: string) {

        await this.dataSource.transaction(async (manager) => {

            const walletRepo = manager.getRepository(Wallet);
            const documentsRepo = manager.getRepository(Documents);
            const userRepo = manager.getRepository(User);
            
            const document = await documentsRepo.findOne({ where: { id: documentId } });
            if (!document) throw new NotFoundException("The document not found");
    
            const user = await userRepo.findOne({ where: { id: document.userId } });
            if (!user) throw new NotFoundException("The user not found!");

            if (document.status === DocumentStatusEnum.APPROVED && user.kycStatus === KycStatusEnum.APPROVED) throw new BadRequestException("The document approved already!");
            if (document.status !== DocumentStatusEnum.PENDING && user.kycStatus !== KycStatusEnum.UNDER_REVIEW) throw new BadRequestException("The document status set already");
            
            document.status = DocumentStatusEnum.APPROVED;
            user.kycStatus = KycStatusEnum.APPROVED;
            
            const wallet = await walletRepo.findOne({ where: { userId: user.id } });
            if (!wallet) throw new NotFoundException("The wallet not found!");

            const randomAccountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
            const shabaNumber = `${wallet.countryCode}${wallet.controlDigit}${wallet.bankCode}${wallet.accountCodeType}000000${randomAccountNumber}`;

            let checkLuhn = false;
            let mainCardNumber: string;

            while (!checkLuhn) {

                const randomCardNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
                let cardNumber = `603799${randomCardNumber}`;

                const checkCardNumber = this.virtualCardService.checkLuhnAlgorithm(cardNumber);
                if (checkCardNumber) {

                    const checkWallet = await walletRepo.findOne({ where: { cardNumber } });
                    
                    if (!checkWallet) {

                        mainCardNumber = cardNumber;
                        checkLuhn = true;

                    }

                }

            }

            const hashedCardNumber = crypto.createHash('sha256').update(mainCardNumber).digest('hex');

            wallet.accountNumber = randomAccountNumber;
            wallet.shabaNumber = shabaNumber;
            wallet.cardNumber = hashedCardNumber;

            await documentsRepo.save(document);
            await userRepo.save(user);
            await walletRepo.save(wallet);
            await this.notficationService.notficationForUser(user.id, "Accept Kyc", `Your request for kyc confirmed`);

        })


        return { message: "The document approved successfully and account created successfully!" }

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
        await this.notficationService.notficationForUser(user.id, "Accept Kyc", `Your request for kyc rejected`);

        return { message: "The document rejected successfully" }

    }

    async freezeAccount (userId: string) {

        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException("The wallet not found!");

        if (wallet.status === WalletStatusEnum.FREEZED) throw new BadRequestException("The wallet is freeze already");
        wallet.status = WalletStatusEnum.FREEZED;

        await this.walletRepo.save(wallet);
        return { message: "The account made freeze" }

    }

    async unFreezeAccount (userId: string) {

        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException("The wallet not found!");

        if (wallet.status !== WalletStatusEnum.FREEZED) throw new BadRequestException("The wallet is not freeze");
        wallet.status = WalletStatusEnum.Active;

        await this.walletRepo.save(wallet);
        return { message: "The account made unfreeze" }

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
