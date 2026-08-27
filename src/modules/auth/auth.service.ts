import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { VitalRecordsService } from '../vital-records/vital-records.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly vitalRecordsService: VitalRecordsService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService

    ) {}

    async signUp (data: SignUpDto) {

        const checkUser = await this.userRepo.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (checkUser) throw new ConflictException("User already signed up");

        await this.vitalRecordsService.isMatch(data.phoneNumber, data.nationalCode);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUnverifiedUser = this.userRepo.create({ phoneNumber: data.phoneNumber, email: data.email, nationalCode: data.nationalCode, password: data.password });
        await this.userRepo.save(newUnverifiedUser);
        
        await this.redisService.setOtp(`otp:${data.phoneNumber}`, otpCode, 120000)
        await this.mailService.sendOtp(data.email, otpCode);

        return { message: "The otp Code is sent to you" }

    }

}
