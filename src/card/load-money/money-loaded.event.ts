export class MoneyLoadedEvent {
    constructor(
        readonly amount: number,
        readonly cardId: string
    ) {}
}