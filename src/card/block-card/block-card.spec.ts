import {Test} from "@nestjs/testing";
import {EventBus} from "@nestjs/cqrs";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {Card} from "../card";
import {Currency} from "../../currency";
import {BlockCardCommand} from "./block-card.command";
import {BlockCardHandler} from "./block-card.handler";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {CardAlreadyBlockedException} from "../exceptions/card-already-blocked.exception";
import {CardBlockedEvent} from "./card-blocked.event";

describe('Block Card', () => {
    const cardId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const currency = Currency.GBP;
    const cardNumber = '4087551534272554';
    const ccv = '166';
    const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
    const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const command = new BlockCardCommand(cardId, userId);


    let eventBus: EventBus,
        cardRepository: CardRepository,
        blockCardHandler: BlockCardHandler,
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
                BlockCardHandler
            ]
        }).compile();
        eventBus = module.get<EventBus>(EventBus);
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
        blockCardHandler = module.get<BlockCardHandler>(BlockCardHandler);

        cardMock = new Card(cardId, currency, 0, cardNumber, ccv, userId, walletId);
    });

    it('should throw exception if card does not exist', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(undefined);
        await expect(blockCardHandler.execute(command)).rejects.toBeInstanceOf(CardIdDoesNotExistException);
    });

    it('should throw exception if userId does not match with card', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        const commandOtherUserId = new BlockCardCommand(cardId, '3b8cbd4b-2365-4ab1-a907-8e28c75225fb');
        await expect(blockCardHandler.execute(commandOtherUserId)).rejects.toBeInstanceOf(CardDoesNotBelongToUserException);
    });

    it('should throw exception if card already blocked', async () => {
        cardMock.status = false;
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await expect(blockCardHandler.execute(command)).rejects.toBeInstanceOf(CardAlreadyBlockedException);
    });

    it('should block and save the card', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await blockCardHandler.execute(command);
        cardMock.status = false;
        expect(cardRepository.save).toHaveBeenCalledWith(cardMock);
    });

    it('should dispatch a Cart Blocked Event', async () => {
        jest.spyOn(cardRepository, 'findById').mockResolvedValue(cardMock);
        await blockCardHandler.execute(command);
        expect(eventBus.publish).toHaveBeenCalledWith(new CardBlockedEvent(cardId));
    });
})