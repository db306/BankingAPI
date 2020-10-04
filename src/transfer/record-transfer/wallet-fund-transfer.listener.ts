import {CommandBus, EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {FundsTransferedEvent} from "../../wallet/transfer-funds/funds-transfered.event";
import {RecordTransferCommand} from "./record-transfer.command";
import {TargetType} from "../target-type";

@EventsHandler(FundsTransferedEvent)
export class WalletFundTransferListener implements IEventHandler<FundsTransferedEvent> {

    constructor(
        private readonly commandBus: CommandBus
    ) {}

    async handle(event: FundsTransferedEvent): Promise<void> {
        await this.commandBus.execute(
            new RecordTransferCommand(
                event.destinationAmount,
                event.originCurrency,
                event.destinationCurrency,
                event.originWalletId,
                event.destinationWalletId,
                TargetType.WALLET,
                event.commission
            )
        );
        return;
    }

}