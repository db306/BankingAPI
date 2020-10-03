import {HttpException, HttpStatus} from "@nestjs/common";

export class OrphanCardException extends HttpException {
    constructor() {
        super('The parent wallet of the card does not exist', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}