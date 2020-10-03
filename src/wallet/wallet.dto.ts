import {Currency} from "../currency";

export interface WalletDto{
    id: string;
    currentBalance: number;
    currency: Currency;
    companyId: string;
}