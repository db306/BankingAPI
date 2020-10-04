import {CommandBus} from "@nestjs/cqrs";
import {Test} from "@nestjs/testing";
import {WalletFundTransferListener} from "./wallet-fund-transfer.listener";
import {FundsTransferedEvent} from "../../wallet/transfer-funds/funds-transfered.event";
import {Currency} from "../../currency";
import {RecordTransferCommand} from "./record-transfer.command";
import {TargetType} from "../target-type";

describe('Record Wallet Fund Transfer', () => {
    let commandBus: CommandBus,
        walletFundTransferListener: WalletFundTransferListener;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn()
                    }
                },
                WalletFundTransferListener
            ]
        }).compile();

        walletFundTransferListener = module.get<WalletFundTransferListener>(WalletFundTransferListener);
        commandBus = module.get<CommandBus>(CommandBus)
    });


    const originWalletId = '6050726e-fc5c-4778-90a1-9175af09b647';
    const destinationWalletId = 'f921308b-57cd-4ba5-aba6-6c9aa5bffad7';
    const originCurrency = Currency.EUR;
    const destinationCurrency = Currency.GBP;
    const initialAmount = 1000;
    const destinationAmount = 900;
    const commission = 100;
    const timestamp = new Date();

    const event = new FundsTransferedEvent(
        originWalletId,
        destinationWalletId,
        originCurrency,
        destinationCurrency,
        initialAmount,
        destinationAmount,
        commission,
        timestamp
    );

    it('should dispatch a record transfer command', async () => {
        await walletFundTransferListener.handle(event);
        expect(commandBus.execute).toHaveBeenCalledWith(
            new RecordTransferCommand(
                destinationAmount,
                originCurrency,
                destinationCurrency,
                originWalletId,
                destinationWalletId,
                TargetType.WALLET,
                commission
            )
        );
    })
});