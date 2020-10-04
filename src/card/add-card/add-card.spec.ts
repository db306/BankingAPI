import {Test} from "@nestjs/testing";
import {EventBus} from "@nestjs/cqrs";
import {WalletRepository} from "../../wallet/wallet.repository";
import {CardRepository} from "../card.repository";
import {WalletRepositoryToken} from "../../wallet/wallet-repository.token";
import {CardRepositoryToken} from "../card-repository.token";
import {AddCardHandler} from "./add-card.handler";
import {CardGeneratorToken} from "../card-generator.token";
import {AddCardCommand} from "./add-card.command";
import {WalletIdDoesNotExistException} from "../../wallet/exceptions/wallet-id-does-not-exist.exception";
import {Wallet} from "../../wallet/wallet";
import {Currency} from "../../currency";
import {CardGenerator} from "../card.generator";
import {CardVo} from "../card.vo";
import {Card} from "../card";
import * as uuid from 'uuid';
import {CardAddedEvent} from "./card-added.event";

jest.mock('uuid', () => {
    return {
        v4: () => ''
    };
});

describe('Adding a new card', () => {
    let eventBus: EventBus,
        walletRepository: WalletRepository,
        cardRepository: CardRepository,
        cardGenerator: CardGenerator,
        addCardHandler: AddCardHandler;

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
                            save: jest.fn()
                        }
                    },
                    {
                        provide: CardGeneratorToken,
                        useValue: {
                            generateCardNumber: jest.fn()
                        }
                    },
                    AddCardHandler
                ]
            }).compile();

        eventBus = module.get<EventBus>(EventBus);
        walletRepository = module.get<WalletRepository>(WalletRepositoryToken);
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
        cardGenerator = module.get<CardGenerator>(CardGeneratorToken)
        addCardHandler = module.get<AddCardHandler>(AddCardHandler);
    });

    describe('when adding a new card', () => {
        const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
        const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
        const companyId = 'bc7fbf02-79d1-4e32-b3b6-07ae580377bc';
        const cardNumber = '4087551534272554';
        const cardId = '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e';
        const currency = Currency.GBP;
        (uuid.v4 as any) = () => cardId;
        const ccv = '166';
        const mockWallet = new Wallet(walletId, 0, currency, companyId)
        const command = new AddCardCommand(walletId, userId);

        it('should throw an exception if the wallet does not exist', async () => {
            jest.spyOn(walletRepository, 'findById').mockImplementation(() => undefined);
            await expect(addCardHandler.execute(command)).rejects.toBeInstanceOf(WalletIdDoesNotExistException);
        })
        it('should generate new card numbers', async () => {
            jest.spyOn(walletRepository, 'findById').mockImplementation(() => Promise.resolve(mockWallet));
            jest.spyOn(cardGenerator, 'generateCardNumber').mockImplementation(() => Promise.resolve({number: cardNumber, ccv: ccv} as CardVo));
            await addCardHandler.execute(command);
            expect(cardGenerator.generateCardNumber).toHaveBeenCalledTimes(1);
        })
        it('should save the new card', async () => {
            jest.spyOn(walletRepository, 'findById').mockImplementation(() => Promise.resolve(mockWallet));
            jest.spyOn(cardGenerator, 'generateCardNumber').mockImplementation(() => Promise.resolve({number: cardNumber, ccv: ccv} as CardVo));
            await addCardHandler.execute(command);
            expect(cardRepository.save).toHaveBeenCalledWith(new Card(cardId, currency, 0, cardNumber, ccv, userId, walletId));
        })
        it('should publish an event with the new card', async () => {
            jest.spyOn(walletRepository, 'findById').mockImplementation(() => Promise.resolve(mockWallet));
            jest.spyOn(cardGenerator, 'generateCardNumber').mockImplementation(() => Promise.resolve({number: cardNumber, ccv: ccv} as CardVo));
            await addCardHandler.execute(command);
            expect(eventBus.publish).toHaveBeenCalledWith(new CardAddedEvent(cardId, userId, companyId, walletId));
        })
        it('should return the uuid of the card when all valid', async () => {
            jest.spyOn(walletRepository, 'findById').mockImplementation(() => Promise.resolve(mockWallet));
            jest.spyOn(cardGenerator, 'generateCardNumber').mockImplementation(() => Promise.resolve({number: cardNumber, ccv: ccv} as CardVo));
            const cardIdReturned = await addCardHandler.execute(command);
            expect(cardIdReturned).toEqual(cardId);
        })
    })
})