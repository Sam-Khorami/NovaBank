import { VirtualCardTransactionStatusEnum } from "src/common/types/entities.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { VirtualCard } from "./virtualCard.entity";

@Entity("virtual_card_transaction")
export class VirtualCardTransaction {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'numeric', precision: 20, scale: 8, nullable: false })
    amount: string;

    @Column({ type: "varchar", nullable: true })
    merchant: string;

    @Column({ type: "enum", enum: VirtualCardTransactionStatusEnum, default: VirtualCardTransactionStatusEnum.SUCCESS, nullable: false })
    status: VirtualCardTransactionStatusEnum;

    @ManyToOne(() => VirtualCard, (virtualCard) => virtualCard.transactions)
    virtualCard: VirtualCard;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}