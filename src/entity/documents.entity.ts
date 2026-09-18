import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./users.entity";
import { DocumentStatusEnum } from "src/common/types/entities.enum";


@Entity("documents")
export class Documents {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    file: string;

    @Column({ type: "enum", enum: DocumentStatusEnum, nullable: false, default: DocumentStatusEnum.PENDING })
    status: DocumentStatusEnum;

    @ManyToOne(() => User, (user) => user.documents, { onDelete: "CASCADE" })
    user: User;

    @Index()
    @Column({ type: "uuid" })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}