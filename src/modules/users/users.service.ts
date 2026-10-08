import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KycStatusEnum, LoanStatusEnum } from 'src/common/types/entities.enum';
import { Documents } from 'src/entity/documents.entity';
import { User } from 'src/entity/users.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NotficationsService } from '../notfications/notfications.service';
import { Wallet } from 'src/entity/wallet.entity';
import { RedisService } from '../redis/redis.service';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { Decimal } from 'decimal.js';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { Loan } from 'src/entity/loan.entity';
import { GetInstallmentsQueryDto } from './dto/getInstallment.dto';
import { VirtualCard } from 'src/entity/virtualCard.entity';
import bcrypt from "bcrypt";

@Injectable()
export class UsersService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>,
        @InjectRepository(VirtualCard) private readonly virtualCardRepo: Repository<VirtualCard>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepo: Repository<WalletTransaction>,
        @InjectRepository(LoanInstallments) private readonly installmentsRepo: Repository<LoanInstallments>,
        private readonly notficationService: NotficationsService,
        private readonly redisService: RedisService

    ) {}

    async uploadDocument (image: Express.Multer.File, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found");
        if (user.kycStatus !== KycStatusEnum.NOT_SUBMITTED) throw new BadRequestException("Your request set already");

        const checkDocument = await this.documentsRepo.findOne({ where: { userId } });
        if (checkDocument) throw new ConflictException("Your request set already");

        const documentName = `/uploads/${image.filename}`;
        const newDocument = this.documentsRepo.create({ file: documentName, user: { id: userId }, userId });
        user.kycStatus = KycStatusEnum.UNDER_REVIEW;

        await this.documentsRepo.save(newDocument);
        await this.userRepo.save(user);

        await this.notficationService.notficationForUser(user.id, "Request For Check Document", `Your request for checking document set`);
        return { message: "Your document uploaded and your request set" }

    }

    async getMyAccountDetails (request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found");

        const wallet = await this.walletRepo.findOne({ where: { userId }, select: { accountNumber: true, cardNumber: true, shabaNumber: true, balance: true, status: true, user: { phoneNumber: true, email: true } } });
        if (!wallet) throw new NotFoundException("The wallet not found!");

        return { wallet }

    }

    async getBalance (request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found");

        const balance = await this.redisService.get(`user:balance:${userId}`);
        if (balance) return { balance }
        
        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new BadRequestException("The wallet not found!");

        await this.redisService.set(`user:balance:${userId}`, wallet.balance.toString(), 60000);
        const redisBalance = await this.redisService.get(`user:balance:${userId}`);
        return { balance: redisBalance }

    }

    async firstDeposit (request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found");

        const walletTransaction = await this.walletTransactionRepo.findOne({ where: { userId } });
        if (walletTransaction) throw new BadRequestException("You are not able to have any first deposit, you've done it once");

        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new BadRequestException("The wallet not found!");

        const depositValue = new Decimal(10000);

        const previousBalance = new Decimal(wallet.balance);
        const newBalance = new Decimal(previousBalance.toFixed(8) + depositValue.toFixed(8));
        wallet.balance = newBalance.toFixed(8);

        const newTransaction = this.walletTransactionRepo.create({ amount: depositValue.toFixed(8), balanceBefore: previousBalance.toFixed(8), balanceAfter: newBalance.toFixed(8), wallet: { id: wallet.id }, walletId: wallet.id, user: { id: userId }, userId });
        await this.walletTransactionRepo.save(newTransaction);

        await this.walletRepo.save(wallet);
        await this.notficationService.notficationForUser(user.id, "First Deposit", `The first deposit has been made and 10000 toman were added to your wallet`);
        return { message: "The deposit to your account was successfull" }

    }

    async getMyLoanDetails (request: Request) {

        const userId = request["user"].id;

        const loans = await this.loanRepo.find({ where: { userId }, select: { id: true, monthlyPayment: true, interestRate: true, months: true, primaryAmount: true, reason: true, status: true } });
        if (loans.length === 0 || !loans) throw new NotFoundException("Loan Not Found");

        return { loans }

    }

    async getMyInstallments (request: Request, loanId: string, query: GetInstallmentsQueryDto) {

        const userId = request["user"].id;
        
        const loan = await this.loanRepo.findOne({ where: { id: loanId, userId } });
        if (!loan) throw new NotFoundException("Loan Not Found!");
        if (loan.status !== LoanStatusEnum.ACTIVE && loan.status !== LoanStatusEnum.APPROVED && loan.status !== LoanStatusEnum.COMPLETED) throw new BadRequestException("The Loan is under review or already rejected");

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<LoanInstallments> = {};

        if (query.status) where.status = query.status;
        where.loanId = loanId;

        const [statuses, total] = await this.installmentsRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });
        return { data: statuses , pagination: { page: query.page, limit: query.limit, total } }

    }

    async getMyProfileDetails (request: Request) {

        const userId = request["user"].id;

        const user = await this.userRepo.findOne({ where: { id: userId }, select: { firstName: true, lastName: true, email: true, phoneNumber: true, nationalCode: true, role: true } });
        if (!user) throw new NotFoundException("User Not Found!");

        return { user }

    }

    async getMyVirtualCards (virtualCardId: string, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found!");

        const wallet = await this.walletRepo.findOne({ where: { userId } });
        if (!wallet) throw new NotFoundException("The wallet not found!");        

        const virtualCard = await this.virtualCardRepo.findOne({ where: { id: virtualCardId, walletId: wallet.id }, select: { lable: true, last4Digits: true, expiryDate: true, spendingLimit: true, spendingAmount: true, cardType: true, status: true } });
        if (!virtualCard) throw new NotFoundException("The virtual card not found!");

        return { virtualCard }

    }

}
