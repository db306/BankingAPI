import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {UnloadFundsWhenBlockedListener} from "./unload-funds-when-blocked.listener";
import {Test} from "@nestjs/testing";
import {Currency} from "../../currency";
import {Card} from "../card";
import {CardBlockedEvent} from "../block-card/card-blocked.event";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CommandBus} from "@nestjs/cqrs";
import {CardIsActiveException} from "../exceptions/card-is-active.exception";
import {UnloadMoneyCommand} from "./unload-money.command";

describe('Unload Card when blocked', () => {
    let cardRepository: CardRepository,
        listener: UnloadFundsWhenBlockedListener,
        commandBus: CommandBus;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: CardRepositoryToken,
                    useValue: {
                        findById: jest.fn(),
                    }
                },
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn()
                    }
                },
                UnloadFundsWhenBlockedListener
            ]
        }).compile();
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
        listener = module.get<UnloadFundsWhenBlockedListener>(UnloadFundsWhenBlockedListener);
        commandBus = module.get<CommandBus>(CommandBus);
    });

    describe('when getting a Card Blocked Event', () => {

        const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
        const cardId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
        const balance = 1000;
        const currency = Currency.GBP;
        const cardNumber = '4087551534272554';
        const ccv = '166';
        const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        const event = new CardBlockedEvent(cardId);

        it('should throw an exception if the card does not exist', async () => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(undefined);
            await expect(listener.handle(event)).rejects.toBeInstanceOf(CardIdDoesNotExistException);
        });
        it('should throw an exception if the card is not blocked', async () => {
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            await expect(listener.handle(event)).rejects.toBeInstanceOf(CardIsActiveException);
        });
        it('should dispatch an unload command with the current balance within the card', async () => {
            cardMock.status = false;
            jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
            await listener.handle(event);
            expect(commandBus.execute).toHaveBeenCalledWith(new UnloadMoneyCommand(userId, cardId, balance));
        });
    });
})