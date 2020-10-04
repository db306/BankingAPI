import {HttpException, HttpStatus} from "@nestjs/common";

export class WalletDoesNotBelongToCompanyException extends HttpException{
    constructor() {
        super('You cannot transfer funds from other company wallets', HttpStatus.FORBIDDEN);
    }
}