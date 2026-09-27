import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { LoanStatusEnum } from "src/common/types/entities.enum";


@Entity("loans")
export class Loan {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    primaryAmount: string;

    @Column({ type: "int", nullable: true })
    interestRate: number | null;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: true })
    monthlyPayment: number | null;

    @Column({ type: "int", nullable: false, default: 12 })
    months: number;

    @Column({ type: "enum", enum: LoanStatusEnum, nullable: false, default: LoanStatusEnum.PENDING })
    status: LoanStatusEnum;

    @Column({ type: "text", nullable: true })
    reason: string | null;

    @ManyToOne(() => User, (user) => user.loans)
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}