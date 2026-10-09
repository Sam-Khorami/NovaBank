import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([Loan, LoanInstallments])

  ],
  providers: [TasksService]
})
export class TasksModule {}
