import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ip } from 'src/entity/ip.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IpService {

    private BLOCKED_UNTIL: number;
    private WINDOW_TIME: number;
    private MAX_REQUEST: number


    constructor (

        @InjectRepository(Ip) private readonly ipRepo: Repository<Ip>

    ) {

        this.BLOCKED_UNTIL = 2;
        this.WINDOW_TIME = 2;
        this.MAX_REQUEST = 10;

    }


    async ipTracker (ip: string) {

        const now = new Date(Date.now());

        const checkIp = await this.ipRepo.findOne({ where: { ip } });
        if (!checkIp) {

            const newIp = this.ipRepo.create({ ip, windowStart: now, requestCount: 1 });
            await this.ipRepo.save(newIp);
            return;

        }

        if (checkIp.isBlocked) {

            const blockTime = checkIp.blockedUntil;
            if (blockTime! > now) throw new BadRequestException("You are blocked cause your spams!");

            checkIp.isBlocked = false;
            checkIp.blockedUntil = null;
            checkIp.requestCount = 1;
            checkIp.windowStart = now;

            await this.ipRepo.save(checkIp);
            return;

        }

        if (checkIp.requestCount > this.MAX_REQUEST) {

            checkIp.isBlocked = true;
            checkIp.blockedUntil = new Date(now.getTime() + this.BLOCKED_UNTIL * 60 * 1000);
            await this.ipRepo.save(checkIp);
            throw new BadRequestException("You are blocked cause your spams!"); 

        }

        const windowEnd = new Date(checkIp.windowStart.getTime() + this.WINDOW_TIME * 60 * 1000);
        if (windowEnd < now) {

            checkIp.windowStart = now;
            checkIp.requestCount = 0;
            await this.ipRepo.save(checkIp);
            return;

        }

        checkIp.requestCount += 1;
        await this.ipRepo.save(checkIp);
        return;

    }

}
