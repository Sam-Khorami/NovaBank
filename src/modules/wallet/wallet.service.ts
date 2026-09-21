import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Idempotency } from 'src/entity/idempotency.entity';
import { Transfers } from 'src/entity/transfers.entity';
import { User } from 'src/entity/users.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { Repository } from 'typeorm';
import { TransferByCardNumberDto } from './dto/transferByCardNumber.dto';
import { DataSource } from "typeorm";
import { IdempotencyStatusEnum, KycStatusEnum, TransactionTypeEnum, WalletStatusEnum } from 'src/common/types/entities.enum';
import { NotficationsService } from '../notfications/notfications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WalletService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly transactionRepo: Repository<WalletTransaction>,
        @InjectRepository(Idempotency) private readonly idempotencyRepo: Repository<Idempotency>,
        @InjectRepository(Transfers) private readonly transfersRepo: Repository<Transfers>,
        private readonly dataSource: DataSource,
        private readonly notficationService: NotficationsService,
        private readonly mailService: MailService

    ) {}

    async transferByCardNumber (data: TransferByCardNumberDto, request: Request, idempotencyKey: string) {
        
        if (!idempotencyKey) throw new BadRequestException("The idempotency key is requiered!");
        
        await this.dataSource.transaction(async (manager) => {
            
            // Getting Repositories
            const walletRepo = manager.getRepository(Wallet);
            const transactionRepo = manager.getRepository(WalletTransaction);
            const userRepo = manager.getRepository(User);
            const idempotencyRepo = manager.getRepository(Idempotency);
            const transfersRepo = manager.getRepository(Transfers);
            
            // Getting Send User Info
            const senderId = request["user"].id;
            const sender = await userRepo.findOne({ where: { id: senderId } });
            if (!sender) throw new NotFoundException("The user not found!");
    
            // Checking Idempotency Key
            const checkIdempotency = await idempotencyRepo.findOne({ where: { userId: senderId, key: idempotencyKey } });
            if (checkIdempotency) return { message: "The transfer payment was successfully completed" }
    
            // Getting Receiver Wallet
            const receiverWallet = await walletRepo.findOne({ where: { cardNumber: data.receiverCardNumber, status: WalletStatusEnum.Active } });
            if (!receiverWallet) throw new NotFoundException("The receiver not found!");
    
            // Getting Receiver Info
            const receiver = await userRepo.findOne({ where: { id: receiverWallet.userId } });
            if (!receiver || receiver.kycStatus !== KycStatusEnum.APPROVED) throw new BadRequestException("The receiver not found!");
    
            // Getting Sender Wallet
            const senderWallet = await walletRepo.findOne({ where: { userId: senderId, status: WalletStatusEnum.Active } });
            if (!senderWallet) throw new NotFoundException("The sender wallet not found!");
            if (senderWallet.balance <= data.amount) throw new BadRequestException("The balance is not enough for this operation");
            
            // Getting Previous & New Sender Balance
            const previousSenderBalance = Number(senderWallet.balance);
            const newSenderBalance = Number(previousSenderBalance - data.amount);

            // Create Transaction For Sender & Save Changes
            senderWallet.balance = newSenderBalance;
            const newSenderTransaction = transactionRepo.create({ balanceBefore: previousSenderBalance, balanceAfter: newSenderBalance, amount: data.amount, type: TransactionTypeEnum.WITHDRAW, wallet: { id: senderWallet.id }, walletId: senderWallet.id, user: { id: senderId }, userId: senderId });
            
            await transactionRepo.save(newSenderTransaction);
            await walletRepo.save(senderWallet);
            
            // Sender Notfications
            await this.notficationService.notficationForUser(senderId, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);
            await this.mailService.sendMailToUser(sender.email, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);

            // Getting Previous & New Receiver Balance
            const previousReceiverBalance = Number(receiverWallet.balance);
            const newReceiverBalance = Number(previousReceiverBalance + data.amount);

            // Create Transaction For Receiver & Save Changes
            receiverWallet.balance = newReceiverBalance;
            const newReceiverTransaction = transactionRepo.create({ balanceBefore: previousReceiverBalance, balanceAfter: newReceiverBalance, amount: data.amount, type: TransactionTypeEnum.DEPOSIT, wallet: { id: receiverWallet.id }, walletId: receiverWallet.id, user: { id: receiver.id }, userId: receiver.id });

            await transactionRepo.save(newReceiverTransaction);
            await walletRepo.save(receiverWallet);

            // Receiver Notfications
            await this.notficationService.notficationForUser(receiver.id, "Deposit", `The amount of ${data.amount} toman deposit to your account`);
            await this.mailService.sendMailToUser(receiver.email, "Deposit", `The amount of ${data.amount} toman deposit to your account`);

            // Transfer Created & Save Changes
            const newTransfer = transfersRepo.create({ amount: data.amount, sender, senderId, receiver, receiverId: receiver.id });
            await transfersRepo.save(newTransfer);

            // Idempotency Created & Save Changes
            const newIdempotency = idempotencyRepo.create({ key: idempotencyKey, status: IdempotencyStatusEnum.COMPLETED, user: { id: senderId }, userId: senderId, transfer: { id: newTransfer.id }, transferId: newTransfer.id });
            await idempotencyRepo.save(newIdempotency);

        })

        return { message: "The transfer payment was successfully completed" }

    }

}
