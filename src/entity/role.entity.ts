import { UserRoleEnum } from "src/common/types/entities.enum";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Permission } from "./permission.entity";


@Entity("role")
export class Role {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "enum", enum: UserRoleEnum, nullable: false, default: UserRoleEnum.USER })
    name: UserRoleEnum;

    @ManyToMany(() => Permission, (permissions) => permissions)
    @JoinTable({ name: "role_permission" })
    permissions: Permission[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}