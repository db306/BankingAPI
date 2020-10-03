export class MoneyUnloadedEvent {
    constructor(
        readonly amount: number,
        readonly cardId: string
    ) {}
}