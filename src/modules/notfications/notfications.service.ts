import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notfications } from 'src/entity/notfication.entity';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';

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

}
