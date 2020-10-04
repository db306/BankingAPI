import {HttpException, HttpStatus} from "@nestjs/common";

export class CouldNotConvertCurrenciesException extends HttpException{
    constructor() {
        super('Oops ! Could not convert currency amounts at this time', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}