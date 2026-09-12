import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("permission")
export class Permission {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}