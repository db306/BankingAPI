import {Column, Entity, PrimaryColumn} from "typeorm";
import {Currency} from "../currency";

@Entity()
export class Wallet {
    @PrimaryColumn('uuid')
    id: string;

    @Column('int')
    currentBalance: number;

    @Column({length: "3"})
    currency: Currency

    @Column('uuid')
    companyId: string;

    @Column('boolean')
    master: boolean;

    constructor(
        id: string,
        currentBalance: number,
        currency: Currency,
        companyId: string
    ) {
        this.id = id;
        this.currentBalance = currentBalance;
        this.currency = currency;
        this.companyId = companyId;
        this.master = false;
    }

    loadMoney(amount: number){
        this.currentBalance += amount;
    }

    unloadMoney(amount: number): void{
        this.currentBalance -= amount;
    }
}