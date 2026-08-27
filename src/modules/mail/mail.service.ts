import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodeMailer from "nodemailer";

@Injectable()
export class MailService {

    private transporter: nodeMailer.Transporter;

    constructor(private readonly configService: ConfigService) {

        this.transporter = nodeMailer.createTransport({

            service: "gmail",
            auth: {

                user: this.configService.get("GMAIL_USER"),
                pass: this.configService.get("GMAIL_PASSWORD")

            }

        }) 

    }

    async sendOtp (to: string, otp: string) {

        this.transporter.sendMail({

            from: this.configService.get("GMAIL_USER"),
            to: to,
            subject: "Otp Code",
            text: `Your otp code is ${otp} you have got only 2 minutes`

        });

    }

}
