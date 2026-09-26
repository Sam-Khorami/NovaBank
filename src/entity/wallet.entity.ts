import { BeforeInsert, Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { AccountCodeTypeEnum, AccountTypeEnum, CountryCodeEnum, WalletStatusEnum } from "src/common/types/entities.enum";
import { WalletTransaction } from "./walletTransaction.entity";
import { VirtualCard } from "./virtualCard.entity";
import crypto from "crypto";

@Entity("wallet")
export class Wallet {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false, default: 0 })
    balance: string;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: true })
    accountNumber: string | null;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: true })
    shabaNumber: string | null;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: true })
    cardNumber: string | null;

    @Column({ type: "enum", enum: CountryCodeEnum, nullable: false, default: CountryCodeEnum.IR })
    countryCode: CountryCodeEnum;

    @Column({ type: "varchar", nullable: false, default: "06" })
    controlDigit: string;

    @Column({ type: "varchar", nullable: false, default: "017" })
    bankCode: string;

    @Column({ type: "enum", enum: AccountCodeTypeEnum, nullable: false, default: AccountCodeTypeEnum.ZERO })
    accountCodeType: AccountCodeTypeEnum;

    @Column({ type: "enum", enum: AccountTypeEnum, nullable: false, default: AccountTypeEnum.ZERO_DEPOSIT_ACCOUNT })
    accountType: AccountTypeEnum;

    @Column({ type: "enum", enum: WalletStatusEnum, default: WalletStatusEnum.Active, nullable: false })
    status: WalletStatusEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.wallet, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @OneToMany(() => WalletTransaction, (walletTransactions) => walletTransactions.wallet)
    transactions: WalletTransaction[];

    @OneToMany(() => VirtualCard, (virtualCards) => virtualCards.wallet)
    virtualCards: VirtualCard[];

    @BeforeInsert()
    async hashInformations () {
        this.cardNumber = crypto.createHash("sha256").update(this.cardNumber).digest("hex");
    }

}