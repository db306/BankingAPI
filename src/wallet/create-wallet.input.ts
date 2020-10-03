import {Currency} from "../currency";
import {IsEnum, IsInt, Min} from "class-validator";

export class CreateWalletInput{
    @IsInt()
    @Min(0)
    balance: number;

    @IsEnum(Currency)
    currency: Currency;
}