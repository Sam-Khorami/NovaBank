import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { VitalRecordsService } from '../vital-records/vital-records.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { OtpVerificationDto } from './dto/otpVerification.dto';
import { UserVerificationEnum } from 'src/common/types/entities.enum';
import { Wallet } from 'src/entity/wallet.entity';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        private readonly vitalRecordsService: VitalRecordsService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService

    ) {}

    async signUp (data: SignUpDto) {

        const checkUser = await this.userRepo.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (checkUser) throw new ConflictException("User already signed up");

        // await this.vitalRecordsService.isMatch(data.phoneNumber, data.nationalCode);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUnverifiedUser = this.userRepo.create({ phoneNumber: data.phoneNumber, email: data.email, nationalCode: data.nationalCode, password: data.password });
        await this.userRepo.save(newUnverifiedUser);

        const newWallet = this.walletRepo.create({ user: newUnverifiedUser });
        await this.walletRepo.save(newWallet);
        
        await this.redisService.setOtp(`otp:${data.phoneNumber}`, otpCode, 120000)
        await this.mailService.sendOtp(data.email, otpCode);

        return { message: "The otp Code is sent to you" }

    }

    async otpVerification (data: OtpVerificationDto, response: Response) {

        const user = await this.userRepo.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (!user) throw new NotFoundException("User Not Found");
        if (user.emailVerification === UserVerificationEnum.VERIFIED && user.userVerification === UserVerificationEnum.VERIFIED) throw new BadRequestException("User already logged in");

        const getOtp = await this.redisService.get(`otp:${data.phoneNumber}`);
        if (!getOtp) throw new BadRequestException("The otp expired or not found!");
        if (getOtp !== data.otp) throw new BadRequestException("Wrong otp entered");
        
        await this.userRepo.update({ phoneNumber: data.phoneNumber }, { emailVerification: UserVerificationEnum.VERIFIED, userVerification: UserVerificationEnum.VERIFIED});
        
        const accessToken = await this.jwtService.signAsync({ id: user.id, role: user.role });
        response.cookie("access_token", accessToken, {

            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000      ,
            path: "/"      

        })

        return { message: "Welcome, You are login now", accessToken }

    }

}
