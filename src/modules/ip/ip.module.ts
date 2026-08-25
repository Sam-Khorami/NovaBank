import { Module } from '@nestjs/common';
import { IpService } from './ip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ip } from '../entity/ip.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([Ip])

  ],
  providers: [IpService],
  exports: [IpService]
})
export class IpModule {}
