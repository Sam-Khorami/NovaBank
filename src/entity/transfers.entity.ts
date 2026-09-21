import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";


@Entity("transfers")
export class Transfers {

    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}