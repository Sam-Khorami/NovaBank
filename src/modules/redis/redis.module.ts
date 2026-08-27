import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}
