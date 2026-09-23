import { Controller, UseGuards } from '@nestjs/common';
import { VirtualCardService } from './virtual_card.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';

@ApiTags("Virtual Card Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@Controller('virtual-card')
export class VirtualCardController {

  constructor(private readonly virtualCardService: VirtualCardService) {}

}
