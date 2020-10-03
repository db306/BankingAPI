export class UnblockCardCommand{
    constructor(
        readonly cardId: string,
        readonly userId: string
    ) {}
}