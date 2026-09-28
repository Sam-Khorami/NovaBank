import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { LoanStatusEnum } from "src/common/types/entities.enum";
import { LoanInstallments } from "./loanInstallments.entity";


@Index(["userId", "status"])
@Entity("loans")
export class Loan {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    primaryAmount: string;

    @Column({ type: "int", nullable: true })
    interestRate: number | null;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: true })
    monthlyPayment: string | null;

    @Column({ type: "int", nullable: false, default: 12 })
    months: number;

    @Column({ type: "enum", enum: LoanStatusEnum, nullable: false, default: LoanStatusEnum.PENDING })
    status: LoanStatusEnum;

    @Column({ type: "text", nullable: true })
    reason: string | null;

    @OneToMany(() => LoanInstallments, (installments) => installments.loan)
    installments: LoanInstallments[];

    @ManyToOne(() => User, (user) => user.loans)
    user: User;

    @Column({ type: "uuid" })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}