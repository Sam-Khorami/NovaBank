import { Module } from '@nestjs/common';
import { VirtualCardService } from './virtual_card.service';
import { VirtualCardController } from './virtual_card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { VirtualCard } from 'src/entity/virtualCard.entity';
import { VirtualCardTransaction } from 'src/entity/virtualCardTransaction.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { NotficationsModule } from '../notfications/notfications.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Wallet, WalletTransaction, VirtualCard, VirtualCardTransaction]),
    NotficationsModule

  ],
  controllers: [VirtualCardController],
  providers: [VirtualCardService],
})
export class VirtualCardModule {}
