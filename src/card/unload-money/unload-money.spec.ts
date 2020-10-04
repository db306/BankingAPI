import {EventBus} from "@nestjs/cqrs";
import {WalletRepository} from "../../wallet/wallet.repository";
import {CardRepository} from "../card.repository";
import {Test} from "@nestjs/testing";
import {WalletRepositoryToken} from "../../wallet/wallet-repository.token";
import {CardRepositoryToken} from "../card-repository.token";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {Card} from "../card";
import {Currency} from "../../currency";
import {Wallet} from "../../wallet/wallet";
import {OrphanCardException} from "../exceptions/orphan-card.exception";
import {FundsTransferFailedException} from "../exceptions/funds-transfer-failed.exception";
import {UnloadMoneyHandler} from "./unload-money.handler";
import {UnloadMoneyCommand} from "./unload-money.command";
import {MoneyUnloadedEvent} from "./money-unloaded.event";
import {InsufficientFundsInCardException} from "../exceptions/insufficient-funds-in-card.exception";

describe('Unloading Money to card', () => {

    const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
    const cardId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const companyId = '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e';
    const amount = 500;
    const balance = 1000;
    const currency = Currency.GBP;
    const cardNumber = '4087551534272554';
    const ccv = '166';
    const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const command = new UnloadMoneyCommand(userId, cardId, amount);

    let eventBus: EventBus,
        walletRepository: WalletRepository,
        cardRepository: CardRepository,
        unloadMoneyHandler: UnloadMoneyHandler,
        cardMock: Card,
        walletMock: Wallet;

    beforeEach(async () => {
        const module = await Test.createTestingModule(
            {
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
                            findById: jest.fn()
                        }
                    },
                    {
                        provide: CardRepositoryToken,
                        useValue: {
                            save: jest.fn(),
                            findById: jest.fn(),
                            saveInSingleTransaction: jest.fn()
                        }
                    },
                    UnloadMoneyHandler
                ]
            }).compile();

        eventBus = module.get<EventBus>(EventBus);
        walletRepository = module.get<WalletRepository>(WalletRepositoryToken);
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
        unloadMoneyHandler = module.get<UnloadMoneyHandler>(UnloadMoneyHandler);
        cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        walletMock = new Wallet(userId, balance, currency, companyId);
    });

    describe('when unloading a card to its wallet', () => {

        it('should throw exception if card does not exist', async () => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(undefined);
            await expect(unloadMoneyHandler.execute(command)).rejects.toBeInstanceOf(CardIdDoesNotExistException);
        });

        it('should throw exception if userId does not match with card', async () => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            const commandOtherUserId = new UnloadMoneyCommand('3b8cbd4b-2365-4ab1-a907-8e28c75225fb', cardId, amount);
            await expect(unloadMoneyHandler.execute(commandOtherUserId)).rejects.toBeInstanceOf(CardDoesNotBelongToUserException);
        });

        it('should throw an exception if the cards wallet does not exist', async() => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            jest.spyOn(walletRepository, 'findById').mockResolvedValue(undefined);
            await expect(unloadMoneyHandler.execute(command)).rejects.toBeInstanceOf(OrphanCardException);
        });
        it('should throw an exception if insufficient funds to make the transaction', async() => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            cardMock.currentBalance = 400;
            jest.spyOn(walletRepository, 'findById').mockResolvedValue(walletMock);
            await expect(unloadMoneyHandler.execute(command)).rejects.toBeInstanceOf(InsufficientFundsInCardException);
        });
        it('should save the transaction with the amounts transfered', async() => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            jest.spyOn(walletRepository, 'findById').mockResolvedValue(walletMock);
            await unloadMoneyHandler.execute(command);
            cardMock.currentBalance -= amount;
            walletMock.currentBalance += amount;
            expect(cardRepository.saveInSingleTransaction).toHaveBeenCalledWith(cardMock, walletMock)
        });
        it('should throw an exception if the transaction fails', async() => {
            cardMock.currentBalance = balance;
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            jest.spyOn(walletRepository, 'findById').mockResolvedValue(walletMock);
            jest.spyOn(cardRepository, 'saveInSingleTransaction').mockRejectedValue(new Error('Bad Database Error'));
            await expect(unloadMoneyHandler.execute(command)).rejects.toBeInstanceOf(FundsTransferFailedException);
        });
        it('should dispatch an event if the transaction succeeds', async() => {
            cardMock.currentBalance = balance;
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            jest.spyOn(walletRepository, 'findById').mockResolvedValue(walletMock);
            await unloadMoneyHandler.execute(command);
            expect(eventBus.publish).toHaveBeenCalledWith(new MoneyUnloadedEvent(amount, cardId, currency, walletId));
        });
    })
})