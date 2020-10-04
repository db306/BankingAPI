import {TransferRepositoryToken} from "../transfer-repository.token";
import {EventBus} from "@nestjs/cqrs";
import {RecordTransferHandler} from "./record-transfer.handler";
import {TransferRepository} from "../transfer.repository";
import {RecordTransferCommand} from "./record-transfer.command";
import {Currency} from "../../currency";
import {TargetType} from "../target-type";
import {Transfer} from "../transfer";
import * as uuid from 'uuid';
import {Test} from "@nestjs/testing";
import {TransferRecordedEvent} from "./transfer-recorded.event";

jest.mock('uuid', () => {
    return {
        v4: () => ''
    };
});

describe('Record Transfer', () => {

    let transferRepository: TransferRepository,
        eventBus: EventBus,
        recordTransferHandler: RecordTransferHandler;

    beforeEach(async() => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: TransferRepositoryToken,
                    useValue: {
                        save: jest.fn()
                    }
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn()
                    }
                },
                RecordTransferHandler
            ]
        }).compile();

        transferRepository = module.get<TransferRepository>(TransferRepositoryToken);
        eventBus = module.get<EventBus>(EventBus)
        recordTransferHandler = module.get<RecordTransferHandler>(RecordTransferHandler);
    });

        const amount = 100;
        const originCurrency = Currency.EUR;
        const targetCurrency = Currency.GBP;
        const originId = '6050726e-fc5c-4778-90a1-9175af09b647';
        const targetId = 'f921308b-57cd-4ba5-aba6-6c9aa5bffad7';
        const targetType = TargetType.WALLET;
        const conversionFee = 10;

    const command = new RecordTransferCommand(
        amount,
        originCurrency,
        targetCurrency,
        originId,
        targetId,
        targetType,
        conversionFee
    )

    it('should save transfer', async() => {
        const transactionId = 'ebf6dc0f-53c7-4fbe-9676-d3e4b8f9aa7e';
        (uuid.v4 as any) = () => transactionId;
        await recordTransferHandler.execute(command);

        const transfer = new Transfer(
            transactionId,
            command.amount,
            command.originCurrency,
            command.targetCurrency,
            command.originId,
            command.targetId,
            command.targetType,
            command.conversionFee
        );

        transfer.timestamp = expect.any(Date);
        expect(transferRepository.save).toHaveBeenCalledWith(transfer);
    });
    it('should publish Recorded Event', async() => {
        const transactionId = 'ebf6dc0f-53c7-4fbe-9676-d3e4b8f9aa7e';
        (uuid.v4 as any) = () => transactionId;
        await recordTransferHandler.execute(command);
        expect(eventBus.publish).toHaveBeenCalledWith(new TransferRecordedEvent(transactionId))
    });
    it('should return an Id', async() => {
        const transactionId = 'ebf6dc0f-53c7-4fbe-9676-d3e4b8f9aa7e';
        (uuid.v4 as any) = () => transactionId;
        const result = await recordTransferHandler.execute(command);
        expect(result).toEqual(transactionId);
    });
});