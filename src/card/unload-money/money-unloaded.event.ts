import {Currency} from "../../currency";

export class MoneyUnloadedEvent {
    constructor(
        readonly amount: number,
        readonly cardId: string,
        readonly currency: Currency,
        readonly walletId: string
    ) {}
}