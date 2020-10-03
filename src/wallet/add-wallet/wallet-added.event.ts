import {Currency} from "../../currency";

export class WalletAddedEvent {
    constructor(
        public readonly id: string,
        public readonly balance: number,
        public readonly currency: Currency,
        public readonly companyId: string
    ) {
    }
}