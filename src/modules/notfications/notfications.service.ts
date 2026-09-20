import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notfications } from 'src/entity/notfication.entity';
import { User } from 'src/entity/users.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetNotficationsDto } from './dto/getNotfication.dto';

@Injectable()
export class NotficationsService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Notfications) private readonly notficationRepo: Repository<Notfications>

    ) {}

    async notficationForUser (userId: string, title: string, message: string) {

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found!");
        
        const newNotfication = this.notficationRepo.create({ title, message, user: { id: userId }, userId });
        await this.notficationRepo.save(newNotfication);
        return;

    }

    async notficationForUsers (userIds: string[], title: string, message: string) {

        const uniqueUserIds = [...new Set(userIds)];
        if (uniqueUserIds.length === 0) throw new BadRequestException("No Reciever Found!");

        const notfications = uniqueUserIds.map((userId) =>

            this.notficationRepo.create({ title, message, user: { id: userId }, userId })

        )

        return this.notficationRepo.save(notfications);

    }

    async getUnreadNotfications (request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found!");

        const notfications = await this.notficationRepo.find({ where: { userId, isRead: false } });
        if (notfications.length === 0) throw new NotFoundException("You've got no notfications");

        return { notfications }

    }

    async getAllNotfications (request: Request, query: GetNotficationsDto) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found!");

        const offset = (query.page - 1) * query.limit;
        const where: FindOptionsWhere<Notfications> = {};

        if (query.isRead) where.isRead = query.isRead;
        where.userId = userId;

        const [notfications, total] = await this.notficationRepo.findAndCount({ where, skip: offset, take: query.limit, order: { id: "ASC" } });

        return { data: notfications, pagination: { page: query.page, limit: query.limit, total } }

    }

    async readNotfication (request: Request, notficationId: string) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found!");

        const notfication = await this.notficationRepo.findOne({ where: { id: notficationId } });
        if (!notfication) throw new NotFoundException("The notfication not found!");
        if (notfication.userId !== userId) throw new NotFoundException("The notfication not found!");

        notfication.isRead = true;
        await this.notficationRepo.save(notfication);
        return { message: "The notfication read successfully!" }

    }

}
