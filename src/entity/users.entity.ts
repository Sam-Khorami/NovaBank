import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import bcrypt from "bcrypt";
import { KycStatusEnum, UserRoleEnum, UserVerificationEnum } from "src/common/types/entities.enum";
import { Wallet } from "./wallet.entity";
import { WalletTransaction } from "./walletTransaction.entity";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";
import { Documents } from "./documents.entity";
import { Notfications } from "./notfication.entity";
import { Transfers } from "./transfers.entity";
import { Idempotency } from "./idempotency.entity";


@Entity("users")
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false, unique: true })
    phoneNumber: string;

    @Column({ type: "varchar", nullable: false })
    email: string;

    @Column({ type: "varchar", nullable: false })
    nationalCode: string;

    @Column({ type: "varchar", nullable: false })
    password: string;

    @Column({ type: "varchar", nullable: true })
    firstName: string;

    @Column({ type: "varchar", nullable: true })
    lastName: string;

    @Column({ type: "enum", enum: UserRoleEnum, nullable: false, default: UserRoleEnum.USER })
    role: UserRoleEnum | string;

    @Column({ type: "enum", enum: UserVerificationEnum, nullable: false, default: UserVerificationEnum.UNVERIFIED })
    userVerification: UserVerificationEnum;

    @Column({ type: "enum", enum: UserVerificationEnum, nullable: false, default: UserVerificationEnum.UNVERIFIED })
    emailVerification: UserVerificationEnum;

    @Column({ type: "enum", enum: KycStatusEnum, nullable: false, default: KycStatusEnum.NOT_SUBMITTED })
    kycStatus: KycStatusEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => Wallet, (wallet) => wallet.user)
    wallet: Wallet;

    @ManyToMany(() => Role, (roles) => roles)
    @JoinTable({ name: "user_role" })
    roles: Role[];

    @ManyToMany(() => Permission, (permissions) => permissions)
    @JoinTable({ name: "user_permission" })
    permissions: Permission[];

    @OneToMany(() => WalletTransaction, (walletTransactions) => walletTransactions.user)
    walletTransactions: WalletTransaction[];

    @OneToMany(() => Documents, (documents) => documents.user)
    documents: Documents[];

    @OneToMany(() => Notfications, (notfications) => notfications.user)
    notfications: Notfications[];

    @OneToMany(() => Transfers, (transfers) => transfers.sender)
    senders: Transfers[];

    @OneToMany(() => Transfers, (transfers) => transfers.receiver)
    receivers: Transfers[];

    @OneToMany(() => Idempotency, (idempotencies) => idempotencies.user)
    idempotencies: Idempotency[];

    @BeforeInsert()
    async hashPassword () {
        this.password = await bcrypt.hash(this.password, 12);
    }

}