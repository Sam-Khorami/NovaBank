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

}
