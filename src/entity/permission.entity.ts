import { UserPermissionEnum } from "src/common/types/entities.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("permission")
export class Permission {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "enum", enum: UserPermissionEnum, nullable: true })
    name: UserPermissionEnum;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}