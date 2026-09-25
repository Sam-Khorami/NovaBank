import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VirtualCardService } from './virtual_card.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';
import { CreateVirtualCardDto } from './dto/createVirtualCard.dto';
import { KycOnly } from 'src/common/decorators/kyc.decorator';
import { CardTypeQueryDto } from './dto/cardTypeQuery.dto';
import { ChargeDto } from './dto/charge.dto';

@ApiTags("Virtual Card Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@KycOnly()
@Controller('virtual-card')
export class VirtualCardController {

  constructor(private readonly virtualCardService: VirtualCardService) {}

  @ApiOperation({ summary: "Create Virtual Card", description: "With this api user can create a virtual card" })
  @Post("create-virtual-card")
  async createVirtualCard (@Body() data: CreateVirtualCardDto, @Query() query: CardTypeQueryDto, @Req() request: Request) {

    return await this.virtualCardService.createVirtualCard(data, query, request);

  }

  @ApiOperation({ summary: "Charge By Virtual Card", description: "With this api user can have charge by virtual card" })
  @Post("charge")
  async chargeByVirtualCard (@Body() data: ChargeDto, @Req() request: Request) {

    return await this.virtualCardService.chargeByVirtualCard(data, request);

  }

}
