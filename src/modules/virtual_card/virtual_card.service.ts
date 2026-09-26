import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { VirtualCard } from 'src/entity/virtualCard.entity';
import { VirtualCardTransaction } from 'src/entity/virtualCardTransaction.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { Repository } from 'typeorm';
import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
import { CardTypeQueryDto } from './dto/cardTypeQuery.dto';
import { Decimal } from 'decimal.js';
import { ChargeDto } from './dto/charge.dto';
import bcrypt from "bcrypt";
import crypto from "crypto";
import { TransactionTypeEnum, VirtualCardStatus, VirtualCardType } from 'src/common/types/entities.enum';
import { DataSource } from "typeorm";
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { NotficationsService } from '../notfications/notfications.service';

@Injectable()
export class VirtualCardService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(VirtualCard) private readonly virtualCardRepo: Repository<VirtualCard>,
        @InjectRepository(WalletTransaction) private readonly walletTransactionRepo: Repository<WalletTransaction>,
        @InjectRepository(VirtualCardTransaction) private readonly virtualCardTransactionRepo: Repository<VirtualCardTransaction>,
        private readonly notficationService: NotficationsService,
        private readonly dataSource: DataSource

    ) {}

    private checkLuhnAlgorithm (cardNumber: string) {

        let index = 14;
        let lastResult = 0;

        while (index !== -2) {

            let multipleTwo = Number(cardNumber[index]) * 2;
            let mainNumber = 0;

            if (multipleTwo > 9) mainNumber = multipleTwo - 9;
            else mainNumber = multipleTwo;

            let array = cardNumber.split("");
            array[index] = String(mainNumber);
            cardNumber = array.join("");

            index -= 2;

        }

        let array = cardNumber.split("");

        for (let char of array) {

            lastResult += Number(char);

        }

        if (lastResult % 10 === 0) return true;
        else return false;

    }

    private async informationsMatching (cardNumber: string, cvv2: string) {

        const checkLuhn = this.checkLuhnAlgorithm(cardNumber);
        if (!checkLuhn) throw new BadRequestException("The entered card number is invalid");

        const hashedEnteredCardNumber = crypto.createHash('sha256').update(cardNumber).digest('hex');

        const card = await this.virtualCardRepo.findOne({ where: { cardNumber: hashedEnteredCardNumber } });
        if (!card) throw new NotFoundException("The card not found!");

        const isCvv2Valid = await bcrypt.compare(cvv2, card.cvv2);
        if (!isCvv2Valid) throw new BadRequestException("The cvv2 is invalid");

        if (card.status !== VirtualCardStatus.ACTIVE) throw new BadRequestException("Your card is not active any more request for another virtual card");
        
        if (new Date(card.expiryDate) < new Date()) {

            card.status = VirtualCardStatus.EXPIRED;
            await this.virtualCardRepo.save(card);
            throw new BadRequestException("You card has been expired");

        }

        return card.id;

    }

    async createVirtualCard (data: CreateVirtualCardDto, query: CardTypeQueryDto, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { wallet: true } });

        let checkLuhn = false;
        let mainCardNumber: string;

        while (!checkLuhn) {

            const randomCardNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            let cardNumber = `603799${randomCardNumber}`;

            const checkCardNumber = this.checkLuhnAlgorithm(cardNumber);
            if (checkCardNumber) {

                const checkVirtualCard = await this.virtualCardRepo.findOne({ where: { cardNumber } });
                const checkWallet = await this.walletRepo.findOne({ where: { cardNumber } });
                
                if (!checkVirtualCard && !checkWallet) {

                    mainCardNumber = cardNumber;
                    checkLuhn = true;

                }

            }

        }
        
        const last4Digits = mainCardNumber.slice(12, 16);
        const cvv2 = Math.floor(100 + Math.random() * 900).toString();

        const now = new Date()
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + data.expiryMonth);

        const spendingLimit = new Decimal(data.spendingLimit);
        const newVirtualCard = this.virtualCardRepo.create({ lable: data.lable, cardNumber: mainCardNumber, last4Digits, cvv2, cardType: query.cardType, spendingLimit: spendingLimit.toFixed(8), wallet: { id: user.wallet.id }, walletId: user.wallet.id, expiryDate });
        await this.virtualCardRepo.save(newVirtualCard);

        return { message: "Your virtual card was successfully created", info: { mainCardNumber, cvv2, spendingLimit, expiryDate } }

    }

    async chargeByVirtualCard (data: ChargeDto, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });

        const virtualCardId = await this.informationsMatching(data.cardNumber, data.cvv2);
        const virtualCard = await this.virtualCardRepo.findOne({ where: { id: virtualCardId }, relations: { wallet: true } });
        if (!virtualCard) throw new NotFoundException("The virtual card not found!");
        
        const amount = new Decimal(data.amount);
        const spendingLimit = new Decimal(virtualCard.spendingLimit);
        const spendingAmount = new Decimal(virtualCard.spendingAmount);

        if (spendingLimit.lessThan(amount)) throw new BadRequestException("The entered amount is greater than your virtual card limitation");

        const totalAmountLimit = amount.plus(spendingAmount);
        if (spendingLimit.lessThan(totalAmountLimit)) throw new BadRequestException("The entered amount plus your previous spending amount are greater than your spending limit");
        
        const walletBalance = new Decimal(virtualCard.wallet.balance);
        if (walletBalance.lessThan(amount)) throw new BadRequestException("Your balance is not enough");

        const result = await this.dataSource.transaction(async (manager) => {
            
            const walletRepo = manager.getRepository(Wallet);
            const virtualCardRepo = manager.getRepository(VirtualCard);
            const walletTransactionRepo = manager.getRepository(WalletTransaction);
            const virtualCardTransactionRepo = manager.getRepository(VirtualCardTransaction);
            
            const wallet = await walletRepo.findOne({ where: { id: virtualCard.walletId } });
            const card = await virtualCardRepo.findOne({ where: { id: virtualCard.id } });
            
            const newWalletBalance = walletBalance.minus(amount);
            
            wallet.balance = newWalletBalance.toFixed(8);
            const newWalletTransaction = walletTransactionRepo.create({ amount: amount.toFixed(8), balanceBefore: walletBalance.toFixed(8), balanceAfter: newWalletBalance.toFixed(8), user: { id: userId }, userId, wallet: { id: wallet.id }, walletId: wallet.id, type: TransactionTypeEnum.WITHDRAW });

            await walletRepo.save(wallet);
            await walletTransactionRepo.save(newWalletTransaction);

            const newSpendingAmount = spendingAmount.plus(amount);
            
            card.spendingAmount = newSpendingAmount.toFixed(8);
            const newVirtualCardTransaction = virtualCardTransactionRepo.create({ amount: amount.toFixed(8), merchant: data.merchant, virtualCard: { id: card.id }, virtualCardId: card.id });

            
            switch (card.cardType) {
                
                case VirtualCardType.ONE_TIME:
                    
                    card.status = VirtualCardStatus.USED;
                    break;
                    
                case VirtualCardType.LIMITED:
                        
                    if (newSpendingAmount.toFixed(8) === card.spendingLimit) card.status = VirtualCardStatus.LIMIT_REACHED;
                    break;            
                    
            }
                    
            await virtualCardRepo.save(card);
            await virtualCardTransactionRepo.save(newVirtualCardTransaction);   
    
            return { spendingAmount: card.spendingAmount }

        })

        await this.notficationService.addNotificationJob({ userId, email: user.email, title: "Withdrawal", message: `The amount of ${data.amount} toman withdraw from your account with card number = 603799******${virtualCard.last4Digits} \nYour spending amount is = ${result.spendingAmount} \nYou spending limit is = ${virtualCard.spendingLimit}` });

        return { message: "The charge was successfully!" }

    }


}
