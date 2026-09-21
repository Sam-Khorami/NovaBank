import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';
import { KycOnly } from 'src/common/decorators/kyc.decorator';
import { TransferByCardNumberDto } from './dto/transferByCardNumber.dto';

@ApiTags("Wallet Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@KycOnly()
@Controller('wallet')
export class WalletController {
  
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: "Transfer By Card Number", description: "With this api user can have transfer payment by entering card number" })
  @Post("transfer-by-card-number")
  async transferByCardNumber (@Body() data: TransferByCardNumberDto, @Req() request: Request, @Headers("idempotency-key") idempotencyKey: string) {

    return await this.walletService.transferByCardNumber(data, request, idempotencyKey);

  }

}
