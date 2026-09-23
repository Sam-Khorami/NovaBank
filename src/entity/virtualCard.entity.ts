import { VirtualCardStatus, VirtualCardType } from "src/common/types/entities.enum";
import { BeforeInsert, Column, CreateDateColumn, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from "bcrypt";
import { Wallet } from "./wallet.entity";

export class VirtualCard {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: true })
    lable: string;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: false })
    cardNumber: string | null;

    @Column({ type: "varchar", nullable: false })
    last4Digits: string;

    @Column({ type: "varchar", nullable: false })
    cvv2: string;

    @Column({ type: "date", nullable: false })
    expiryDate: Date;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    spendingLimit: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false, default: 0 })
    spendingAmount: string;

    @Column({ type: "enum", enum: VirtualCardType, default: VirtualCardType.STANDARD, nullable: false })
    cardType: VirtualCardType;

    @Column({ type: "enum", enum: VirtualCardStatus, default: VirtualCardStatus.ACTIVE, nullable: false })
    status: VirtualCardStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Wallet, (wallet) => wallet.virtualCards)
    wallet: Wallet;

    @Index()
    @Column({ type: "uuid" })
    walletId: string;

    @BeforeInsert()
    async hashPassword () {
        this.cardNumber = await bcrypt.hash(this.cardNumber, 12);
        this.cvv2 = await bcrypt.hash(this.cvv2, 12);
    }

}