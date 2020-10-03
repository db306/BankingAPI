import {HttpException, HttpStatus} from "@nestjs/common";

export class WalletIdDoesNotExistException extends HttpException{
    constructor() {
        super('Wallet ID does not exist', HttpStatus.BAD_REQUEST);
    }
}