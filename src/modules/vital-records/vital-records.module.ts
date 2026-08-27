import { Module } from '@nestjs/common';
import { VitalRecordsService } from './vital-records.service';

@Module({
  providers: [VitalRecordsService],
  exports: [VitalRecordsService]
})
export class VitalRecordsModule {}
