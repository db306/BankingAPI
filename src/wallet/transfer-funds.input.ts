import {IsInt, IsNotEmpty, IsUUID, Min} from "class-validator";

export class TransferFundsInput{
    @IsUUID()
    @IsNotEmpty()
    destinationWalletId: string;

    @IsInt()
    @Min(1)
    amount: number;
}