import {CommandBus, EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {RecordTransferCommand} from "./record-transfer.command";
import {TargetType} from "../target-type";
import {MoneyUnloadedEvent} from "../../card/unload-money/money-unloaded.event";

@EventsHandler(MoneyUnloadedEvent)
export class CardUnloadedTransferListener implements IEventHandler<MoneyUnloadedEvent> {

    constructor(
        private readonly commandBus: CommandBus
    ) {}

    async handle(event: MoneyUnloadedEvent): Promise<void> {
        await this.commandBus.execute(
            new RecordTransferCommand(
                event.amount,
                event.currency,
                event.currency,
                event.cardId,
                event.walletId,
                TargetType.CARD,
                0
            )
        );
        return;
    }
}