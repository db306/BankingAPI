export class AddCardCommand{
    constructor(
        public readonly walletId: string,
        public readonly userId: string
    ) {}
}