import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Loan, LoanInstallments])

  ],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
