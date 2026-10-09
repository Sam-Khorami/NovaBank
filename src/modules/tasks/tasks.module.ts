import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { ScheduleJob } from './jobs/schedule.job';
import { User } from 'src/entity/users.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Loan, LoanInstallments])

  ],
  providers: [TasksService, ScheduleJob]
})
export class TasksModule {}
