import {Column, Entity, PrimaryColumn} from "typeorm";
import {Currency} from "../currency";
import {TargetType} from "./target-type";

@Entity()
export class Transfer{
    @PrimaryColumn('uuid')
    id: string;

    @Column('timestamp')
    timestamp: Date;

    @Column('bigint')
    amount: number;

    @Column({length: "3"})
    originCurrency: Currency;

    @Column({length: "3"})
    targetCurrency: Currency;

    @Column('int')
    conversionFee?: number;

    @Column('uuid')
    originId: string;

    @Column('uuid')
    targetId: string;

    @Column()
    targetType: TargetType;

    constructor(
        id: string,
        amount: number,
        originCurrency: Currency,
        targetCurrency: Currency,
        originId: string,
        targetId: string,
        targetType: TargetType,
        conversionFee?: number
    ) {
        this.id = id;
        this.amount = amount;
        this.originCurrency = originCurrency;
        this.targetCurrency = targetCurrency;
        this.originId = originId;
        this.targetId = targetId;
        this.targetType = targetType;
        this.conversionFee = conversionFee;
        this.timestamp = new Date();
    }
}