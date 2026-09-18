import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>

    ) {}

}
