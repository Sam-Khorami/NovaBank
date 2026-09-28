import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { KycGuard } from 'src/common/guards/kyc.guard';
import { KycOnly } from 'src/common/decorators/kyc.decorator';
import { LoanDto } from './dto/loan.dto';

@ApiTags("Loan Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, KycGuard)
@KycOnly()
@Controller('loan')
export class LoanController {

  constructor(private readonly loanService: LoanService) {}


  @Post("request-for-loan")
  async loan (@Body() data: LoanDto, @Req() request: Request) {

    return await this.loanService.loan(data, request);

  }

}
