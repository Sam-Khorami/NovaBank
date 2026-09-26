import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Role } from 'src/entity/role.entity';
import { Permission } from 'src/entity/permission.entity';
import { Documents } from 'src/entity/documents.entity';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { NotficationsModule } from '../notfications/notfications.module';
import { VirtualCardModule } from '../virtual_card/virtual_card.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Role, Permission, Documents, Wallet, WalletTransaction]),
    NotficationsModule,
    VirtualCardModule

  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
