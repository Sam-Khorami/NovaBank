import { Module } from '@nestjs/common';
import { IpService } from './ip.service';

@Module({
  providers: [IpService]
})
export class IpModule {}
