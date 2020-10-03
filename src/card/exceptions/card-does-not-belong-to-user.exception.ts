import {HttpException, HttpStatus} from "@nestjs/common";

export class CardDoesNotBelongToUserException extends HttpException{
    constructor() {
        super('Card does not belong to user', HttpStatus.FORBIDDEN);
    }
}