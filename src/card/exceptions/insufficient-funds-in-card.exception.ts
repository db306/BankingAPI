import {HttpException, HttpStatus} from "@nestjs/common";

export class InsufficientFundsInCardException extends HttpException {
    constructor() {
        super('Insufficient funds in card to accomplish transaction', HttpStatus.BAD_REQUEST);
    }
}