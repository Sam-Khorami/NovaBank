import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { Transfers } from "./transfers.entity";


@Entity("idempotency")
export class Idempotency {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index({ unique: true })
    @Column({ type: "varchar", nullable: false })
    key: string;

    @ManyToOne(() => User, (user) => user.idempotencies, { onDelete: "CASCADE" })
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @ManyToOne(() => Transfers, (transfers) => transfers.idempotencies, { onDelete: "CASCADE" })
    transfers: Transfers;

    @Index()
    @Column({ type: "uuid" })
    transferId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}