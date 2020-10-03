import {IsUUID} from "class-validator";

export class CreateCardInput{
    @IsUUID()
    walletId: string
}