import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { WalletStatusEnum } from "src/common/types/entities.enum";
import { WalletTransaction } from "./walletTransaction.entity";


@Entity("wallet")
export class Wallet {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false, default: 0 })
    balance: number

    @Column({ type: "enum", enum: WalletStatusEnum, default: WalletStatusEnum.Active, nullable: false })
    status: WalletStatusEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.wallet)
    @JoinColumn({ name: "userId" })
    user: User;

    @OneToMany(() => WalletTransaction, (walletTransactions) => walletTransactions.wallet)
    transactions: WalletTransaction[];

}