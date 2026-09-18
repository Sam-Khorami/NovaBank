import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import { Repository } from "typeorm";
import { KycStatusEnum } from "../types/entities.enum";
import { Reflector } from "@nestjs/core";
import { KYC_KEY } from "../decorators/kyc.decorator";


@Injectable()
export class KycGuard implements CanActivate {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly reflector: Reflector

    ) {}

    async canActivate (context: ExecutionContext) {

        const kycOnly = this.reflector.getAllAndOverride(KYC_KEY, [ context.getClass(), context.getHandler() ]);
        if (!kycOnly) return true;

        const request = context.switchToHttp().getRequest();
        if (!request.user) throw new UnauthorizedException("The user is unauthorized!");

        let user = request.user;

        user = await this.userRepo.findOneBy({ id: user.id });
        if (!user) throw new NotFoundException("The user not found!");

        if (user.kycStatus !== KycStatusEnum.APPROVED) throw new HttpException("Your account has not yet been confirmed", HttpStatus.LOCKED);
        return true;

    }

}