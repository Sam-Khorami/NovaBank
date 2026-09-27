import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Loan } from "./loan.entity";
import { InstallmentStatusEnum } from "src/common/types/entities.enum";


@Entity("loan_installments")
export class LoanInstallments {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "int", nullable: false })
    installmentsNumber: number;

    @Column({ type: "date", nullable: false })
    dueDate: Date;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    interestAmount: string;
    
    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    principalAmount: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    totalAmount: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: true })
    remainingBalance: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false, default: 0 })
    penaltyAmount: string;

    @Column({ type: "enum", enum: InstallmentStatusEnum, nullable: false, default: InstallmentStatusEnum.PENDING })
    status: InstallmentStatusEnum;

    @Column({ type: "timestamp", nullable: true })
    paidAt: Date | null;

    @ManyToOne(() => Loan, (loan) => loan.installments)
    loan: Loan;

    @Index()
    @Column({ type: "uuid" })
    loanId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}