import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";


@Entity("notfications")
export class Notfications {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    title: string;

    @Column({ type: "text", nullable: false })
    message: string;

    @Index()
    @Column({ type: "boolean", nullable: false, default: false })
    isRead: boolean;

    @ManyToOne(() => User, (user) => user.notfications)
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}