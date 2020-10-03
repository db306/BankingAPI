import {HttpException, HttpStatus} from "@nestjs/common";

export class CardIdDoesNotExistException extends HttpException {
    constructor() {
        super('Card Id does not exist', HttpStatus.BAD_REQUEST);
    }
}