export class TransferFundsCommand {
    constructor(
        readonly originWalletId: string,
        readonly destinationWalletId: string,
        readonly amount: number,
        readonly companyId: string
    ) {
    }
}