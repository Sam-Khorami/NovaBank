import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ip } from '../entity/ip.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IpService {

    constructor (

        @InjectRepository(Ip) private readonly ipRepo: Repository<Ip>

    ) {}

}
