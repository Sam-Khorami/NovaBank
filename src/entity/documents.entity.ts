import { Column, CreateDateColumn, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";


export class Documents {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    file: string;

    @ManyToOne(() => User, (user) => user.documents)
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}