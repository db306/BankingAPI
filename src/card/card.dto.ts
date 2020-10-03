import {Currency} from "../currency";

export interface CardDto{
    id: string;
    currency: Currency;
    currentBalance: number;
    number: string;
    expirationDate: Date;
    ccv: string;
    userId: string;
    status: boolean;
    walletId: string;
}