import {Column, Entity, PrimaryColumn} from "typeorm";
import {Currency} from "../currency";

@Entity()
export class Card {
    @PrimaryColumn('uuid')
    id: string;

    @Column({length: '3'})
    currency: Currency;

    @Column('int')
    currentBalance: number;

    @Column({length: '16'})
    number: string;

    @Column('date')
    expirationDate: Date;

    @Column({length: '3'})
    ccv: string;

    @Column('uuid')
    userId: string;

    @Column('boolean')
    status: boolean;

    @Column('uuid')
    walletId: string;

    constructor(
        id: string,
        currency: Currency,
        currentBalance: number,
        number: string,
        ccv: string,
        userId: string,
        walletId: string
    ){
        this.expirationDate = new Date(new Date().getFullYear(),new Date().getMonth()+1 , new Date().getDate())
        this.status = true;
        this.id = id;
        this.currency = currency;
        this.currentBalance = currentBalance;
        this.number = number;
        this.ccv = ccv;
        this.userId = userId;
        this.walletId = walletId;
    }

    isBlocked(): boolean{
        return !this.status;
    }

    blockCard(): void {
        this.status = false;
    }

    unblockCard(): void {
        this.status = true;
    }

    loadMoney(amount: number){
        this.currentBalance += amount;
    }

    unloadMoney(amount: number): void{
        this.currentBalance -= amount;
    }
}