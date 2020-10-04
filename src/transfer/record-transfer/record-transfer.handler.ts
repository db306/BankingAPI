import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {RecordTransferCommand} from "./record-transfer.command";
import {Inject} from "@nestjs/common";
import {TransferRepositoryToken} from "../transfer-repository.token";
import {Transfer} from "../transfer";
import * as uuid from 'uuid';
import {TransferRepository} from "../transfer.repository";
import {TransferRecordedEvent} from "./transfer-recorded.event";

@CommandHandler(RecordTransferCommand)
export class RecordTransferHandler implements ICommandHandler<RecordTransferCommand>{

    constructor(
        @Inject(TransferRepositoryToken)
        private readonly transferRepository: TransferRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: RecordTransferCommand): Promise<any> {

        const id = uuid.v4();
        const transfer = new Transfer(
            id,
            command.amount,
            command.originCurrency,
            command.targetCurrency,
            command.originId,
            command.targetId,
            command.targetType,
            command.conversionFee
        );

        await this.transferRepository.save(transfer);
        this.eventBus.publish(new TransferRecordedEvent(id));
        return id;
    }
}