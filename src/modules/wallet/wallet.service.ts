import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
import { Decimal } from "decimal.js";
import { TransferByShabaNumberDto } from './dto/transferByShabaCard.dto';

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
        
        const result = await this.dataSource.transaction(async (manager) => {
            
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
            if (checkIdempotency) throw new ConflictException("The transfer payment was successfully completed");
    
            // Getting Receiver Wallet
            const receiverWallet = await walletRepo.findOne({ where: { cardNumber: data.receiverCardNumber, status: WalletStatusEnum.Active } });
            if (!receiverWallet) throw new NotFoundException("The receiver not found!");
    
            // Getting Receiver Info
            const receiver = await userRepo.findOne({ where: { id: receiverWallet.userId } });
            if (!receiver || receiver.kycStatus !== KycStatusEnum.APPROVED) throw new BadRequestException("The receiver not found!");
    
            // Getting Sender Wallet
            const senderWallet = await walletRepo.findOne({ where: { userId: senderId, status: WalletStatusEnum.Active } });
            if (!senderWallet) throw new NotFoundException("The sender wallet not found!");
            
            // Cheking The Balance
            const amount = new Decimal(data.amount);
            const previousSenderBalance = new Decimal(senderWallet.balance);

            if (previousSenderBalance.lessThan(amount)) throw new BadRequestException("The balance is not enough for this operation");
            if (senderWallet.cardNumber === data.receiverCardNumber) throw new BadRequestException("The operation is impossible");

            // Getting Previous & New Sender Balance
            const newSenderBalance = previousSenderBalance.minus(amount);

            // Create Transaction For Sender & Save Changes
            senderWallet.balance = newSenderBalance.toFixed(8);
            const newSenderTransaction = transactionRepo.create({ balanceBefore: previousSenderBalance.toFixed(8), balanceAfter: newSenderBalance.toFixed(8), amount: amount.toFixed(8), type: TransactionTypeEnum.WITHDRAW, wallet: { id: senderWallet.id }, walletId: senderWallet.id, user: { id: senderId }, userId: senderId });
            
            await transactionRepo.save(newSenderTransaction);
            await walletRepo.save(senderWallet);
            
            // Getting Previous & New Receiver Balance
            const previousReceiverBalance = new Decimal(receiverWallet.balance);
            const newReceiverBalance = previousReceiverBalance.plus(amount);
            
            // Create Transaction For Receiver & Save Changes
            receiverWallet.balance = newReceiverBalance.toFixed(8);
            const newReceiverTransaction = transactionRepo.create({ balanceBefore: previousReceiverBalance.toFixed(8), balanceAfter: newReceiverBalance.toFixed(8), amount: amount.toFixed(8), type: TransactionTypeEnum.DEPOSIT, wallet: { id: receiverWallet.id }, walletId: receiverWallet.id, user: { id: receiver.id }, userId: receiver.id });
            
            await transactionRepo.save(newReceiverTransaction);
            await walletRepo.save(receiverWallet);
            
            // Transfer Created & Save Changes
            const newTransfer = transfersRepo.create({ amount: amount.toFixed(8), sender, senderId, receiver, receiverId: receiver.id });
            await transfersRepo.save(newTransfer);
            
            // Idempotency Created & Save Changes
            const newIdempotency = idempotencyRepo.create({ key: idempotencyKey, status: IdempotencyStatusEnum.COMPLETED, user: { id: senderId }, userId: senderId, transfer: { id: newTransfer.id }, transferId: newTransfer.id });
            await idempotencyRepo.save(newIdempotency);
            
            return { receiver, sender }

        })

        // Sender Notfications
        await this.notficationService.notficationForUser(result.sender.id, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);
        await this.mailService.sendMailToUser(result.sender.email, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);
        
        // Receiver Notfications
        await this.notficationService.notficationForUser(result.receiver.id, "Deposit", `The amount of ${data.amount} toman deposit to your account`);
        await this.mailService.sendMailToUser(result.receiver.email, "Deposit", `The amount of ${data.amount} toman deposit to your account`);
        
        return { message: "The transfer payment was successfully completed" }

    }


    async transferByShabaNumber (data: TransferByShabaNumberDto, request: Request, idempotencyKey: string) {

        if (!idempotencyKey) throw new BadRequestException("Idempotency key requiered");

        const result = await this.dataSource.transaction(async (manager) => {

            const userRepo = manager.getRepository(User);
            const walletRepo = manager.getRepository(Wallet);
            const transactionRepo = manager.getRepository(WalletTransaction);
            const transfersRepo = manager.getRepository(Transfers);
            const idempotencyRepo = manager.getRepository(Idempotency);

            const senderId = request["user"].id;
            const sender = await userRepo.findOne({ where: { id: senderId }, relations: { wallet: true } });
            if (!sender) throw new NotFoundException("The sender user not found!");
            
            const checkIdempotency = await idempotencyRepo.findOne({ where: { key: idempotencyKey, userId: senderId } });
            if (checkIdempotency) throw new ConflictException("The transfer payment was successfully completed");

            const amount = new Decimal(data.amount);
            const previousSenderBalance = new Decimal(sender.wallet.balance);

            if (previousSenderBalance.lessThan(amount)) throw new BadRequestException("Not enough balance");
            if (sender.wallet.shabaNumber === data.receiverShabaNumber) throw new BadRequestException("This operation is impossible");

            const receiverWallet = await walletRepo.findOne({ where: { shabaNumber: data.receiverShabaNumber, status: WalletStatusEnum.Active }, relations: { user: true } });
            if (!receiverWallet) throw new NotFoundException("The receiver user not found!");
            if (receiverWallet.user.kycStatus !== KycStatusEnum.APPROVED) throw new BadRequestException("The receiver user not found!")

            const newSenderBalance = previousSenderBalance.minus(amount);
            sender.wallet.balance = newSenderBalance.toFixed(8);

            const newSenderTransaction = transactionRepo.create({ amount: amount.toFixed(8), balanceBefore: previousSenderBalance.toFixed(8), balanceAfter: newSenderBalance.toFixed(8), type: TransactionTypeEnum.WITHDRAW, wallet: { id: sender.wallet.id }, walletId: sender.wallet.id, user: { id: senderId }, userId: senderId });
            await transactionRepo.save(newSenderTransaction);
            await walletRepo.save(sender.wallet);

            const previousReceiverBalance = new Decimal(receiverWallet.balance);
            const newReceiverBalance = previousReceiverBalance.plus(amount);
            receiverWallet.balance = newReceiverBalance.toFixed(8)

            const newReceiverTransaction = transactionRepo.create({ amount: amount.toFixed(8), balanceBefore: previousReceiverBalance.toFixed(8), balanceAfter: newReceiverBalance.toFixed(8), type: TransactionTypeEnum.DEPOSIT, wallet: { id: receiverWallet.id }, walletId: receiverWallet.id, user: { id: receiverWallet.user.id }, userId: receiverWallet.user.id });
            await transactionRepo.save(newReceiverTransaction);
            await walletRepo.save(receiverWallet);

            const newTransfer = transfersRepo.create({ amount: amount.toFixed(8), sender, senderId, receiver: { id: receiverWallet.user.id }, receiverId: receiverWallet.user.id });
            await transfersRepo.save(newTransfer);
            
            const newIdempotency = idempotencyRepo.create({ key: idempotencyKey, status: IdempotencyStatusEnum.COMPLETED, user: { id: senderId }, userId: senderId, transfer: { id: newTransfer.id }, transferId: newTransfer.id });
            await idempotencyRepo.save(newIdempotency);
            
            return { receiver: receiverWallet.user, sender }

        })

        await this.notficationService.notficationForUser(result.sender.id, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);
        await this.mailService.sendMailToUser(result.sender.email, "Withdrawal", `The amount of ${data.amount} toman withdraw from your account`);
        
        await this.notficationService.notficationForUser(result.receiver.id, "Deposit", `The amount of ${data.amount} toman deposit to your account`);
        await this.mailService.sendMailToUser(result.receiver.email, "Deposit", `The amount of ${data.amount} toman deposit to your account`);
        
        return { message: "The transfer payment was successfully completed" }

    }

}
