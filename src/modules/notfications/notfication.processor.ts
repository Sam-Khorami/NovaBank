import { Process, Processor } from "@nestjs/bull";
import { InjectRepository } from "@nestjs/typeorm";
import { Notfications } from "src/entity/notfication.entity";
import { User } from "src/entity/users.entity";
import { Repository } from "typeorm";
import { MailService } from "../mail/mail.service";
import type { Job } from "bull";
import { TransferNotficationData } from "src/common/types/interfaces.type";
import { NotficationsService } from "./notfications.service";


@Processor("notfications")
export class NotficationProcessor {

    constructor (

        private readonly mailService: MailService,
        private readonly notficationService: NotficationsService

    ) {}

    @Process("send-transfer-notfication")
    async sendTransferNotfication (job: Job<TransferNotficationData>) {

        try {

            await this.notficationService.notficationForUser(job.data.userId, job.data.title, job.data.message);
            if (job.data.email) await this.mailService.sendMailToUser(job.data.email, job.data.title, job.data.message);

        }

        catch (err) {

            throw err;

        }

    }

}