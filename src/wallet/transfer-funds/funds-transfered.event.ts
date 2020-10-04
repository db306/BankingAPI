import {Currency} from "../../currency";

export class FundsTransferedEvent {
    constructor(
        readonly originWalletId: string,
        readonly destinationWalletId: string,
        readonly originCurrency: Currency,
        readonly destinationCurrency: Currency,
        readonly initialAmount: number,
        readonly destinationAmount: number,
        readonly commission: number,
        readonly timestamp: Date
    ) {
    }
}