import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KycStatusEnum } from 'src/common/types/entities.enum';
import { Documents } from 'src/entity/documents.entity';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { NotficationsService } from '../notfications/notfications.service';
import { Wallet } from 'src/entity/wallet.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>,
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
        return { redisBalance }

    }

}
