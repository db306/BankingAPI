import {HttpException, HttpStatus} from "@nestjs/common";

export class FundsTransferFailedException extends HttpException {
    constructor() {
        super('Funds transaction failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}