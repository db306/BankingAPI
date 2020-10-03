import {HttpException, HttpStatus} from "@nestjs/common";

export class InsufficientFundsInWalletException extends HttpException {
    constructor() {
        super('Insufficient funds in wallet to accomplish transaction', HttpStatus.BAD_REQUEST);
    }
}