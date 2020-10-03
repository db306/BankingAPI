export class LoadMoneyCommand {
    constructor(
        readonly userId: string,
        readonly cardId: string,
        readonly amount: number
    ) {}
}