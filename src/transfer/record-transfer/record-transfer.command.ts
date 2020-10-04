import {Currency} from "../../currency";
import {TargetType} from "../target-type";

export class RecordTransferCommand {
    constructor(
        readonly amount: number,
        readonly originCurrency: Currency,
        readonly targetCurrency: Currency,
        readonly originId: string,
        readonly targetId: string,
        readonly targetType: TargetType,
        readonly conversionFee?: number
    ) {}
}