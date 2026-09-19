import { Module } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { NotficationsController } from './notfications.controller';

@Module({
  controllers: [NotficationsController],
  providers: [NotficationsService],
})
export class NotficationsModule {}
