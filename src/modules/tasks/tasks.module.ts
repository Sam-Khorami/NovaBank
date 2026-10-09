import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { ScheduleJob } from './jobs/schedule.job';

@Module({
  imports: [

    TypeOrmModule.forFeature([Loan, LoanInstallments])

  ],
  providers: [TasksService, ScheduleJob]
})
export class TasksModule {}
