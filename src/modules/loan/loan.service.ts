import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from 'src/entity/loan.entity';
import { LoanInstallments } from 'src/entity/loanInstallments.entity';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoanService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
        @InjectRepository(LoanInstallments) private readonly loanInstallmentsRepo: Repository<LoanInstallments>

    ) {}

}
