import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import { Repository } from "typeorm";
import { PERMISSION_KEY } from "../decorators/permission.decorator";
import { AdminService } from "src/modules/admin/admin.service";


@Injectable()
export class PermissionGuard implements CanActivate {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly adminService: AdminService,
        private reflector: Reflector

    ) {}

    async canActivate (context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: { permissions: true } });
        if (!user) throw new NotFoundException("User Not Found!");

        const askedPermissions: string[] = this.reflector.getAllAndOverride(PERMISSION_KEY, [ context.getHandler(), context.getClass() ]);
        if (!askedPermissions) return true;

        const userPermissions = await this.adminService.getPermissions(userId);

        const check = askedPermissions.every((item) => userPermissions.includes(item));
        return check;

    }

}