import {Currency} from "../../currency";

export class AddWalletCommand {
    constructor(
        public readonly balance: number,
        public readonly currency: Currency,
        public readonly companyId: string
    ) {
    }
}