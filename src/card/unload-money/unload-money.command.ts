export class UnloadMoneyCommand {
    constructor(
        readonly userId: string,
        readonly cardId: string,
        readonly amount: number
    ) {}
}