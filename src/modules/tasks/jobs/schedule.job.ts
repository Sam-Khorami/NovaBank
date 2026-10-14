import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Decimal } from "decimal.js";
import { InstallmentStatusEnum, TransactionTypeEnum, WalletStatusEnum } from "src/common/types/entities.enum";
import { Loan } from "src/entity/loan.entity";
import { LoanInstallments } from "src/entity/loanInstallments.entity";
import { User } from "src/entity/users.entity";
import { Wallet } from "src/entity/wallet.entity";
import { WalletTransaction } from "src/entity/walletTransaction.entity";
import { NotficationsService } from "src/modules/notfications/notfications.service";
import { DataSource, Repository } from "typeorm";


@Injectable()
export class ScheduleJob {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Loan) private readonly loanRepo: Repository<Loan>,
        @InjectRepository(LoanInstallments) private readonly installmentsRepo: Repository<LoanInstallments>,
        private readonly notficationService: NotficationsService,
        private readonly dataSource: DataSource

    ) {}

    async loanPayment () {

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const installments = await this.installmentsRepo.find({ where: { status: InstallmentStatusEnum.PENDING, dueDate: now }, relations: { loan: { user: { wallet: true } } } });

        installments.forEach(async (installment) => {

            const decimalTotalAmount = new Decimal(installment.totalAmount); 
            const walletBalance = new Decimal(installment.loan.user.wallet.balance);

            const walletId = installment.loan.user.wallet.id;
            const installmentId = installment.id;

            const user = await this.userRepo.findOne({ where: { id: installment.loan.userId } });

            if (walletBalance.lessThan(decimalTotalAmount)) {

                const penalty = decimalTotalAmount.times(20 / 100);

                installment.penaltyAmount = penalty.toFixed(8);
                installment.status = InstallmentStatusEnum.OVERDUE;
                await this.installmentsRepo.save(installment);

                await this.notficationService.addNotificationJob({ email: user.email, userId: user.id, title: "Loan Payment", message: `The payment was not successfull you have got amount of ${penalty} for not to payment` });

            }

            else {

                await this.dataSource.transaction(async (manager) => {

                    const walletRepo = manager.getRepository(Wallet);
                    const walletTransactionRepo = manager.getRepository(WalletTransaction);
                    const installmentRepo = manager.getRepository(LoanInstallments);

                    const wallet = await walletRepo.createQueryBuilder("wallet").where("wallet.id = :id", { id: walletId }).setLock("pessimistic_write").getOne();

                    const previousWalletBalance = new Decimal(wallet.balance);
                    const newWalletBalance = previousWalletBalance.minus(decimalTotalAmount);

                    wallet.balance = newWalletBalance.toFixed(8);
                    const newTransaction = walletTransactionRepo.create({ amount: decimalTotalAmount.toFixed(8), balanceBefore: previousWalletBalance.toFixed(8), balanceAfter: newWalletBalance.toFixed(8), user: { id: wallet.userId }, userId: wallet.userId, wallet: { id: walletId }, walletId, type: TransactionTypeEnum.WITHDRAW });

                    await walletRepo.save(wallet);
                    await walletTransactionRepo.save(newTransaction);

                    const installment = await installmentRepo.findOne({ where: { id: installmentId } });
                    installment.status = InstallmentStatusEnum.PAID;

                    await installmentRepo.save(installment);

                })

                await this.notficationService.addNotificationJob({ email: user.email, userId: user.id, title: "Loan Payment", message: `The payment was successfull the amount of ${decimalTotalAmount} withdraw from your wallet` });

            }

        })

        return;

    }

}