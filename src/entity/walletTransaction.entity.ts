import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { TransactionStatusEnum, TransactionTypeEnum } from "src/common/types/entities.enum";
import { Wallet } from "./wallet.entity";


@Entity("wallet_transaction")
export class WalletTransaction {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "enum", enum: TransactionStatusEnum, nullable: false, default: TransactionStatusEnum.SUCCESS })
    status: TransactionStatusEnum;

    @Column({ type: "enum", enum: TransactionTypeEnum, nullable: false, default: TransactionTypeEnum.DEPOSIT })
    type: TransactionTypeEnum

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    amount: number;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    balanceBefore: number;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    balanceAfter: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
    @JoinColumn({ name: "walletId" })
    wallet: Wallet;

    @ManyToOne(() => User, (user) => user.walletTransactions)
    @JoinColumn({ name: "userId" })
    user: User;

}