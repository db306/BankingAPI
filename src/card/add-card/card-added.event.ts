export class CardAddedEvent {
    constructor(
        readonly id,
        readonly userId,
        readonly companyId,
        readonly walletId
    ) {
    }
}