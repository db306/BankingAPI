import {IsInt, Min} from "class-validator";

export class LoadMoneyInput{
    @IsInt()
    @Min(1)
    amount: number;
}