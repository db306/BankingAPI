import {Test, TestingModule} from "@nestjs/testing";
import {EventBus} from "@nestjs/cqrs";
import {WalletRepository} from "../wallet.repository";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {AddWalletHandler} from "./add-wallet.handler";
import * as uuid from 'uuid';
import {AddWalletCommand} from "./add-wallet.command";
import {Currency} from "../../currency";
import {WalletAddedEvent} from "./wallet-added.event";
import {Wallet} from "../wallet";

jest.mock('uuid', () => {
    return {
        v4: () => ''
    };
});

describe('Adding a new Wallet', () => {
    let eventBus: EventBus,
        walletRepository: WalletRepository,
        addWalletHandler: AddWalletHandler;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn()
                    }
                },
                {
                    provide: WalletRepositoryToken,
                    useValue: {
                        save: jest.fn()
                    }
                },
                AddWalletHandler
            ]
        }).compile();
        eventBus = module.get<EventBus>(EventBus);
        walletRepository = module.get<WalletRepository>(WalletRepositoryToken);
        addWalletHandler = module.get<AddWalletHandler>(AddWalletHandler);
    });

    describe('when adding a new wallet', () => {
        const walletId = 'ebf6dc0f-53c7-4fbe-9676-d3e4b8f9aa7e';
        (uuid.v4 as any) = () => walletId;
        const balance = 1000;
        const currency = Currency.EUR;
        const companyId = '705376bc-db17-4341-a543-f849a163db99';
        const command = new AddWalletCommand(balance, currency, companyId);

        it('should return the id generated for the wallet', async () => {
            const result = await addWalletHandler.execute(command);
            expect(result).toEqual(walletId);
        })
        it('should call the save method from the repository', async () => {
            await addWalletHandler.execute(command);
            expect(walletRepository.save).toHaveBeenCalledWith([new Wallet(walletId, balance, currency, companyId)]);
        })
        it('should publish a new WalletAddedEvent', async () => {
            await addWalletHandler.execute(command);
            expect(eventBus.publish).toHaveBeenCalledWith(new WalletAddedEvent(walletId, balance, currency, companyId));
        })
    })
})