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
import { DocumentStatusEnum, InstallmentStatusEnum, KycStatusEnum, LoanStatusEnum, TransactionTypeEnum, WalletStatusEnum } from 'src/common/types/entities.enum';
import { GetUserKycStatusDto } from './dto/getUserKycStatus.dto';
import { GetDocumentStatusDto } from './dto/getDocumentStatus.dto';
import { Wallet } from 'src/entity/wallet.entity';
import { NotficationsService } from '../notfications/notfications.service';
import { VirtualCardService } from '../virtual_card/virtual_card.service';
import crypto from "crypto";
import { AcceptLoanDto } from './dto/acceptLoan.dto';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { Decimal } from 'decimal.js';
import { first } from 'rxjs';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { GetLoanRequestQueryDto } from './dto/getLoanRequest.dto';
import { GetInstallmentsQueryDto } from './dto/getUserInstallment.dto';

@Injectable()
export class AdminService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
        @InjectRepository(LoanInstallments) private readonly installmentsRepo: Repository<LoanInstallments>,
        private readonly dataSource: DataSource,
        private readonly virtualCardService: VirtualCardService,
        private readonly notficationService: NotficationsService

    ) {}

    private buildInstallmentSchedule(months: number, totalMoney: string, interestRate: number) {

        const total = new Decimal(totalMoney);
        const yearInterestRate = new Decimal(interestRate);
        const monthInterestRate = yearInterestRate.dividedBy(100).dividedBy(12);

        const power = monthInterestRate.plus(1).pow(months);
        const fixedInstallment = monthInterestRate.times(power).dividedBy(power.minus(1)).times(total);

        let remainingBalance = total;
        const rows = [];

        const dueDate = this.getNextMonthFirstDate();

        for (let i = 1; i <= months; i++) {

            const interestAmount = remainingBalance.times(monthInterestRate);
            const principalAmount = fixedInstallment.minus(interestAmount);

            remainingBalance = remainingBalance.minus(principalAmount);

            const isLastRow = i === months;
            const finalRemaining = isLastRow ? new Decimal(0) : remainingBalance;

            rows.push({
                installmentsNumber: i,
                dueDate:             new Date(dueDate),
                interestAmount:      interestAmount.toFixed(8),
                principalAmount:     principalAmount.toFixed(8),
                totalAmount:         fixedInstallment.toFixed(8),
                remainingBalance:    finalRemaining.toFixed(8)
            });

            dueDate.setMonth(dueDate.getMonth() + 1);
        }

        return rows;
    
    }

    private getNextMonthFirstDate() {
        
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    }

    private calculateLoan (months: number, totalMoney: string, interestRate: number) {

        const total = new Decimal(totalMoney);
        const yearInterestRate = new Decimal(interestRate);

        const monthInterestRate = yearInterestRate.dividedBy(100).dividedBy(months);

        const power = monthInterestRate.plus(1).pow(months);

        const firstCalculate = monthInterestRate.times(power);
        const secondCalculate = power.minus(1);

        const installment = firstCalculate.dividedBy(secondCalculate).times(total);
        return installment;

    }

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

    async acceptLoan (data: AcceptLoanDto, loanId: string) {

        const loan = await this.loanRepo.findOne({ where: { id: loanId }, relations: { user: true } });
        if (!loan) throw new NotFoundException("The loan not found!");
        if (loan.status !== LoanStatusEnum.PENDING) throw new BadRequestException("The loan request has already been reviewed");

        const installment = this.calculateLoan(loan.months, loan.primaryAmount, data.interestRate);
        const installmentRows = this.buildInstallmentSchedule(loan.months, loan.primaryAmount, data.interestRate);

        await this.dataSource.transaction(async (manager) => {

            const loanRepo = manager.getRepository(Loan);
            const installmentRepo = manager.getRepository(LoanInstallments);
            const walletRepo = manager.getRepository(Wallet);
            const walletTransactionRepo = manager.getRepository(WalletTransaction);

            const wallet = await walletRepo.createQueryBuilder("wallet").where("wallet.userId = :userId", { userId: loan.userId }).setLock("pessimistic_write").getOne();
            if (!wallet) throw new NotFoundException("The wallet not found!");

            const previousBalance = new Decimal(wallet.balance);
            const totalMoney = new Decimal(loan.primaryAmount);
            
            const newBalance = previousBalance.plus(totalMoney);
            wallet.balance = newBalance.toFixed(8);

            const newTransaction = walletTransactionRepo.create({ balanceBefore: previousBalance.toFixed(8), balanceAfter: newBalance.toFixed(8), amount: totalMoney.toFixed(8), user: { id: loan.userId }, userId: loan.userId, type: TransactionTypeEnum.ADMINDEPOSIT, wallet: { id: wallet.id }, walletId: wallet.id });
            await walletRepo.save(wallet);
            await walletTransactionRepo.save(newTransaction);

            const installmentEntities = installmentRepo.create(installmentRows.map(row => ({ ...row, loan: { id: loan.id }, loanId: loan.id })));
            await installmentRepo.save(installmentEntities);


            loan.status = LoanStatusEnum.ACTIVE;
            loan.interestRate = data.interestRate;
            loan.monthlyPayment = installment.toFixed(8);
            await loanRepo.save(loan);

        })

        await this.notficationService.addNotificationJob({ userId: loan.userId, email: loan.user.email, title: "Accept Loan", message: `Hi there,\nYour request for loan accepted with ${data.interestRate} interest rate percent` });
        return { message: "Loan approved and activated successfully" }

    }

    async rejectLoan (loanId: string) {

        const loan = await this.loanRepo.findOne({ where: { id: loanId }, relations: { user: true } });
        if (!loan) throw new NotFoundException("The loan not found!");
        if (loan.status !== LoanStatusEnum.PENDING) throw new BadRequestException("The loan request has already been reviewed")

        loan.status = LoanStatusEnum.REJECTED;
        await this.loanRepo.save(loan);

        await this.notficationService.addNotificationJob({ userId: loan.userId, email: loan.user.email, title: "Reject Loan", message: `Hi there,\nYour request for loan rejected` });
        return { message: "The loan rejected successfully" }

    }

    async getLoanRequests (query: GetLoanRequestQueryDto) {

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<Loan> = {}

        if (query.status) where.status = query.status;
        const [statuses, total] = await this.loanRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });

        return { data: statuses , pagination: { page: query.page, limit: query.limit, total } }

    }

    async getUserInstallments (loanId: string, query: GetInstallmentsQueryDto) {

        const loan = await this.loanRepo.findOne({ where: { id: loanId } });
        if (!loan) throw new NotFoundException("Loan not found!");
        if (loan.status !== LoanStatusEnum.APPROVED && loan.status !== LoanStatusEnum.ACTIVE) throw new BadRequestException("The loan did not approved yet");

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<LoanInstallments> = {};

        if (query.status) where.status = query.status;
        where.loanId = loanId;

        const [statuses, total] = await this.installmentsRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });
        return { data: statuses , pagination: { page: query.page, limit: query.limit, total } }

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
