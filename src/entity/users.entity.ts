import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import bcrypt from "bcrypt";


@Entity("users")
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    phoneNumber: string;

    @Column({ type: "varchar", nullable: false })
    nationalCode: string;

    @Column({ type: "varchar", nullable: false })
    password: string;

    @Column({ type: "varchar", nullable: true })
    firstName: string;

    @Column({ type: "varchar", nullable: true })
    lastName: string;

    @BeforeInsert()
    async hashPassword () {
        this.password = await bcrypt.hash(this.password, 12);
    }

}