import {CommandBus} from "@nestjs/cqrs";
import {Test} from "@nestjs/testing";
import {Currency} from "../../currency";
import {RecordTransferCommand} from "./record-transfer.command";
import {TargetType} from "../target-type";
import {MoneyLoadedEvent} from "../../card/load-money/money-loaded.event";
import {CardUnloadedTransferListener} from "./card-unloaded-transfer.listener";

describe('Record Card UnLoaded Transfer', () => {
    let commandBus: CommandBus,
        cardUnloadedTransferListener: CardUnloadedTransferListener;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn()
                    }
                },
                CardUnloadedTransferListener
            ]
        }).compile();

        cardUnloadedTransferListener = module.get<CardUnloadedTransferListener>(CardUnloadedTransferListener);
        commandBus = module.get<CommandBus>(CommandBus)
    });


    const cardId = '6050726e-fc5c-4778-90a1-9175af09b647';
    const walletId = 'f921308b-57cd-4ba5-aba6-6c9aa5bffad7';
    const currency = Currency.EUR;
    const amount = 1000;

    const event = new MoneyLoadedEvent(
        amount,
        cardId,
        currency,
        walletId
    );

    it('should dispatch a record transfer command', async () => {
        await cardUnloadedTransferListener.handle(event);
        expect(commandBus.execute).toHaveBeenCalledWith(
            new RecordTransferCommand(
                amount,
                currency,
                currency,
                cardId,
                walletId,
                TargetType.CARD,
                0
            )
        );
    })
});