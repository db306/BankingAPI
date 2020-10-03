import {HttpException, HttpStatus} from "@nestjs/common";

export class CardAlreadyActiveException extends HttpException{
    constructor() {
        super('Cannot unblock an already active card', HttpStatus.BAD_REQUEST);
    }
}