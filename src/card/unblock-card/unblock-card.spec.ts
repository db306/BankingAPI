import {EventBus} from "@nestjs/cqrs";
import {CardRepository} from "../card.repository";
import {Test} from "@nestjs/testing";
import {CardRepositoryToken} from "../card-repository.token";
import {Currency} from "../../currency";
import {Card} from "../card";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {UnblockCardHandler} from "./unblock-card.handler";
import {UnblockCardCommand} from "./unblock-card.command";
import {CardUnblockedEvent} from "./card-unblocked.event";
import {CardAlreadyActiveException} from "../exceptions/card-already-active.exception";

describe('Unblock Card', () => {

    const cardId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const currency = Currency.GBP;
    const cardNumber = '4087551534272554';
    const ccv = '166';
    const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
    const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const command = new UnblockCardCommand(cardId, userId);

    let eventBus: EventBus,
        cardRepository: CardRepository,
        unblockCardHandler: UnblockCardHandler,
        cardMock: Card;
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
                    provide: CardRepositoryToken,
                    useValue: {
                        save: jest.fn(),
                        findById: jest.fn()
                    }
                },
                UnblockCardHandler
            ]
        }).compile();
        eventBus = module.get<EventBus>(EventBus);
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
        unblockCardHandler = module.get<UnblockCardHandler>(UnblockCardHandler);

        cardMock = new Card(cardId, currency, 0, cardNumber, ccv, userId, walletId);
        cardMock.status = false;
    });

    it('should throw exception if card does not exist', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(undefined);
        await expect(unblockCardHandler.execute(command)).rejects.toBeInstanceOf(CardIdDoesNotExistException);
    });

    it('should throw exception if userId does not match with card', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        const commandOtherUserId = new UnblockCardCommand(cardId, '3b8cbd4b-2365-4ab1-a907-8e28c75225fb');
        await expect(unblockCardHandler.execute(commandOtherUserId)).rejects.toBeInstanceOf(CardDoesNotBelongToUserException);
    });

    it('should throw exception if card already active', async () => {
        cardMock.status = true;
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await expect(unblockCardHandler.execute(command)).rejects.toBeInstanceOf(CardAlreadyActiveException);
    });

    it('should unblock and save the card', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await unblockCardHandler.execute(command);
        cardMock.status = true;
        expect(cardRepository.save).toHaveBeenCalledWith(cardMock);
    });

    it('should dispatch a Cart Unblocked Event', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await unblockCardHandler.execute(command);
        expect(eventBus.publish).toHaveBeenCalledWith(new CardUnblockedEvent(cardId));
    });
})