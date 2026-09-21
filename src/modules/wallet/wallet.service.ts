import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Idempotency } from 'src/entity/idempotency.entity';
import { Transfers } from 'src/entity/transfers.entity';
import { User } from 'src/entity/users.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(WalletTransaction) private readonly transactionRepo: Repository<WalletTransaction>,
        @InjectRepository(Idempotency) private readonly idempotencyRepo: Repository<Idempotency>,
        @InjectRepository(Transfers) private readonly transfersRepo: Repository<Transfers>

    ) {}

}
