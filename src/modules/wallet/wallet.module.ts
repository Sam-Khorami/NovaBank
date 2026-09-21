import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { Idempotency } from 'src/entity/Idempotency.entity';
import { Transfers } from 'src/entity/transfers.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Wallet, WalletTransaction, Idempotency, Transfers])

  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
