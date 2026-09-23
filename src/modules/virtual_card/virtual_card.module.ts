import { Module } from '@nestjs/common';
import { VirtualCardService } from './virtual_card.service';
import { VirtualCardController } from './virtual_card.controller';

@Module({
  controllers: [VirtualCardController],
  providers: [VirtualCardService],
})
export class VirtualCardModule {}
