import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { VirtualCard } from 'src/entity/virtualCard.entity';
import { VirtualCardTransaction } from 'src/entity/virtualCardTransaction.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VirtualCardService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(VirtualCard) private readonly virtualCardRepo: Repository<VirtualCard>,
        @InjectRepository(VirtualCardTransaction) private readonly virtualCardTransactionRepo: Repository<VirtualCardTransaction>

    ) {}

    async checkLuhnAlgorithm (cardNumber: string) {

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

}
