import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Payload } from "../types/interfaces.type";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService

    ) {}

    async canActivate (context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();

        const token = request.headers.authorization ?? request.cookies?.access_token;
        if (!token) throw new UnauthorizedException("User is unauthorized");
        const mainToken = token.split(" ")[1];

        let payload: Payload;

        try {
            payload = await this.jwtService.verifyAsync<Payload>(mainToken, { secret: process.env.JWT_SECRET_KEY })
        }

        catch {
            throw new UnauthorizedException("Invalid Token")
        }

        if (!payload.id || !payload.role) throw new UnauthorizedException("User is unauthorized");

        const user = await this.userRepo.findOne({ where: { id: payload.id }, select: { id: true, firstName: true, lastName: true, phoneNumber: true, role: true, nationalCode: true } });
        if (!user) throw new UnauthorizedException("Authorized User Not Found!");

        request.user = { ...user, id: user.id }
        return true;

    }

}