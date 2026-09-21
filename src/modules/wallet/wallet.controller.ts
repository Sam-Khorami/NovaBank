import { Controller, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';
import { KycOnly } from 'src/common/decorators/kyc.decorator';

@ApiTags("Wallet Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@KycOnly()
@Controller('wallet')
export class WalletController {
  
  constructor(private readonly walletService: WalletService) {}

}
