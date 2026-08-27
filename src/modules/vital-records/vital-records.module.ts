import { Module } from '@nestjs/common';
import { VitalRecordsService } from './vital-records.service';

@Module({
  providers: [VitalRecordsService]
})
export class VitalRecordsModule {}
