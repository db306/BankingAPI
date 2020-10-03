import {HttpException, HttpStatus} from "@nestjs/common";

export class CardIsActiveException extends HttpException{
    constructor() {
        super('Cannot automatically unload a card when blocked if the card is active', HttpStatus.CONFLICT);
    }
}