import { Controller, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';
import { KycOnly } from 'src/common/decorators/kyc.decorator';

@ApiTags("Loan Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@KycOnly()
@Controller('loan')
export class LoanController {

  constructor(private readonly loanService: LoanService) {}

}
