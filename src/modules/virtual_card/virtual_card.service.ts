import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { VirtualCard } from 'src/entity/virtualCard.entity';
import { VirtualCardTransaction } from 'src/entity/virtualCardTransaction.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { Repository } from 'typeorm';
import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
import { CardTypeQueryDto } from './dto/cardTypeQuery.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class VirtualCardService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(VirtualCard) private readonly virtualCardRepo: Repository<VirtualCard>,
        @InjectRepository(VirtualCardTransaction) private readonly virtualCardTransactionRepo: Repository<VirtualCardTransaction>

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

}
