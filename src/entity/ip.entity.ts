import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("ip")
export class Ip {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", nullable: false, unique: true })
    ip!: string;

    @Column({ type: "int", nullable: false, default: 0 })
    requestCount!: number;

    @Column({ type: "timestamp", nullable: false })
    windowStart!: Date;

    @Column({ type: "boolean", nullable: false, default: false })
    isBlocked!: boolean;

    @Column({ type: "timestamp", nullable: true })
    blockedUntil!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}