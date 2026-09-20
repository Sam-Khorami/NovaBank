import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Documents } from 'src/entity/documents.entity';
import { AdminModule } from '../admin/admin.module';
import { NotficationsModule } from '../notfications/notfications.module';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Documents, Wallet, WalletTransaction]),
    AdminModule,
    NotficationsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
