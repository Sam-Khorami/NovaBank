import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {

    constructor (

        @Inject(CACHE_MANAGER) private cacheManager: Cache

    ) {}

    async setOtp (key: string, value: string, ttl?: number) {

        return await this.cacheManager.set(key, value, ttl);

    }

    async get (key: string) {

        return await this.cacheManager.get(key);

    }

    async delete (key: string) {

        return await this.cacheManager.del(key);

    }

}
