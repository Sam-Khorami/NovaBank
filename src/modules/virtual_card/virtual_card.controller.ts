import { Controller } from '@nestjs/common';
import { VirtualCardService } from './virtual_card.service';

@Controller('virtual-card')
export class VirtualCardController {
  constructor(private readonly virtualCardService: VirtualCardService) {}
}
