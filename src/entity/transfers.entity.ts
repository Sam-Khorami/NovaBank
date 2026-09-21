import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { Idempotency } from "./idempotency.entity";


@Entity("transfers")
export class Transfers {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    amount: number;

    @ManyToOne(() => User, (user) => user.senders, { onDelete: "CASCADE" })
    sender: User;

    @Index()
    @Column({ type: "uuid" })
    senderId: string;

    @ManyToOne(() => User, (user) => user.receivers, { onDelete: "CASCADE" })
    receiver: User;

    @Index()
    @Column({ type: "uuid" })
    receiverId: string;

    @OneToMany(() => Idempotency, (idempotencies) => idempotencies.transfers)
    idempotencies: Idempotency[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}