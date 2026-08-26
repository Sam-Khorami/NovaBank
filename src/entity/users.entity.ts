import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from "bcrypt";
import { UserRoleEnum } from "src/common/types/entities.enum";
import { Wallet } from "./wallet.entity";
import { WalletTransaction } from "./walletTransaction.entity";


@Entity("users")
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    phoneNumber: string;

    @Column({ type: "varchar", nullable: false })
    nationalCode: string;

    @Column({ type: "varchar", nullable: false })
    password: string;

    @Column({ type: "varchar", nullable: true })
    firstName: string;

    @Column({ type: "varchar", nullable: true })
    lastName: string;

    @Column({ type: "enum", enum: UserRoleEnum, nullable: false, default: UserRoleEnum.USER })
    role: UserRoleEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => Wallet, (wallet) => wallet.user)
    wallet: Wallet;

    @OneToMany(() => WalletTransaction, (walletTransactions) => walletTransactions.user)
    walletTransactions: WalletTransaction[];

    @BeforeInsert()
    async hashPassword () {
        this.password = await bcrypt.hash(this.password, 12);
    }

}