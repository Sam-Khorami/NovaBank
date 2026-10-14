import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleJob } from './jobs/schedule.job';

@Injectable()
export class TasksService {

    constructor (

        private readonly scheduleJob: ScheduleJob

    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async loanPayment () {

        await this.scheduleJob.loanPayment();

    }

}
