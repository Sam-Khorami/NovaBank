import { Injectable } from '@nestjs/common';
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

}
