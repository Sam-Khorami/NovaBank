import { BadRequestException, Body, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { VitalRecordsService } from '../vital-records/vital-records.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { OtpVerificationDto } from './dto/otpVerification.dto';
import { UserRoleEnum, UserVerificationEnum } from 'src/common/types/entities.enum';
import { Wallet } from 'src/entity/wallet.entity';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';
import bcrypt from "bcrypt";
import { Role } from 'src/entity/role.entity';
import { Permission } from 'src/entity/permission.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        private readonly vitalRecordsService: VitalRecordsService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService

    ) {}

    async signUp (data: SignUpDto) {

        const checkUser = await this.userRepo.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (checkUser) throw new ConflictException("User already signed up");

        let role: Role;
        
        role = await this.roleRepo.findOne({ where: { name: UserRoleEnum.USER } });
        if (!role) {

            const newRole = this.roleRepo.create({ name: UserRoleEnum.USER });
            role = await this.roleRepo.save(newRole);

        }

        await this.vitalRecordsService.isMatch(data.phoneNumber, data.nationalCode);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUnverifiedUser = this.userRepo.create({ phoneNumber: data.phoneNumber, email: data.email, nationalCode: data.nationalCode, password: data.password, roles: [role] });
        await this.userRepo.save(newUnverifiedUser);

        const newWallet = this.walletRepo.create({ user: newUnverifiedUser });
        await this.walletRepo.save(newWallet);
        
        await this.redisService.setOtp(`otp:${data.phoneNumber}`, otpCode, 120000)
        await this.mailService.sendOtp(data.email, otpCode);

        return { message: "The otp Code is sent to you" }

    }

    async login (data: LoginDto) {

        const user = await this.userRepo.findOne({ where: { phoneNumber: data.phoneNumber } });
        if (!user) throw new NotFoundException("The user with this information not found!");
        if (user.emailVerification === UserVerificationEnum.UNVERIFIED) throw new BadRequestException("You need to sign up");

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new NotFoundException("The user with this information not found!");

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.redisService.setOtp(`otp:${data.phoneNumber}`, otpCode, 120000);
        await this.mailService.sendOtp(user.email, otpCode);

        return { message: "The otp code sent to your email" }

    }

    async logout (request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("User NotFound");
        if (user.userVerification === UserVerificationEnum.UNVERIFIED) throw new BadRequestException("You are logout already");

        user.userVerification = UserVerificationEnum.UNVERIFIED;
        await this.userRepo.save(user);

        return { message: "You are logged out now" }

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
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/"      

        })

        return { message: "Welcome, You are login now", accessToken }

    }

    async changePassword (data: ChangePasswordDto, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("User Not Found!");

        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(data.pastPassword, hashedPassword);
        if (!isMatch) throw new BadRequestException("The password are not match");

        const newHashedPassword = await bcrypt.hash(data.newPassword, 12);
        await this.userRepo.update({ id: userId }, { password: newHashedPassword });
        return { message: "Your password changed successfully!" }

    }

}
