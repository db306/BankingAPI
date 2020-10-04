import {HttpException, HttpStatus} from "@nestjs/common";

export class TransfersCannotBeAcrossCompaniesException extends HttpException{
    constructor() {
        super('You cannot transfer funds from 2 different companies', HttpStatus.FORBIDDEN);
    }
}