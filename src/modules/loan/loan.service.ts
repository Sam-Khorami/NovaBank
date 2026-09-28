import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';
import { LoanDto } from './dto/loan.dto';
import { LoanStatusEnum } from 'src/common/types/entities.enum';
import { Decimal } from 'decimal.js';

@Injectable()
export class LoanService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
        @InjectRepository(LoanInstallments) private readonly loanInstallmentsRepo: Repository<LoanInstallments>

    ) {}

    async loan (data: LoanDto, request: Request) {

        const userId = request["user"].id;

        const loan = await this.loanRepo.findOne({ where: { userId, status: LoanStatusEnum.ACTIVE } });
        if (loan) throw new BadRequestException("You already have an active loan");

        const primaryAmount = new Decimal(data.amount);
        const newLoanRequest = this.loanRepo.create({ months: data.months, reason: data.reason, primaryAmount: primaryAmount.toFixed(8), user: { id: userId }, userId });

        await this.loanRepo.save(newLoanRequest);
        return { message: "The request for loan registered" }

    }

}
