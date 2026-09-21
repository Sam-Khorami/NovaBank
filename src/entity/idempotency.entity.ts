import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { Transfers } from "./transfers.entity";
import { IdempotencyStatusEnum } from "src/common/types/entities.enum";


@Entity("idempotency")
export class Idempotency {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: false })
    key: string;

    @Index()
    @Column({ type: "enum", enum: IdempotencyStatusEnum, nullable: false, default: IdempotencyStatusEnum.PENDING })
    status: IdempotencyStatusEnum;

    @ManyToOne(() => User, (user) => user.idempotencies, { onDelete: "CASCADE" })
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @ManyToOne(() => Transfers, (transfer) => transfer.idempotencies, { onDelete: "CASCADE" })
    transfer: Transfers;

    @Index()
    @Column({ type: "uuid" })
    transferId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}