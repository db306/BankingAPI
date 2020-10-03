import {HttpException, HttpStatus} from "@nestjs/common";

export class CardAlreadyBlockedException extends HttpException{
    constructor() {
        super('The card is already blocked', HttpStatus.BAD_REQUEST);
    }
}