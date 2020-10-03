import {Test} from "@nestjs/testing";
import {CardRepositoryToken} from "./card-repository.token";
import {RandomCardGenerator} from "./random-card.generator";
import {CardRepository} from "./card.repository";
import {Card} from "./card";
import {Currency} from "../currency";

describe('Random Card Generator', () => {
    let randomCardGenerator: RandomCardGenerator,
        cardRepository: CardRepository;
    beforeEach(async () => {
        const module = await Test.createTestingModule(
            {
                providers: [
                    {
                        provide: CardRepositoryToken,
                        useValue: {
                            findCardByNumber: jest.fn()
                        }
                    },
                    RandomCardGenerator
                ]
            }
        ).compile();
        randomCardGenerator = module.get<RandomCardGenerator>(RandomCardGenerator);
        cardRepository = module.get<CardRepository>(CardRepositoryToken);
    });

    it('should return a Card Value Object', async () => {
        const card = await randomCardGenerator.generateCardNumber();
        expect(card.number.length).toEqual(16);
        expect(card.ccv.length).toEqual(3);
    });

    it('should return a different number if card exists', async () => {
        const cardMock = new Card('67547d30-8aeb-4a69-8af2-97b71dfdbfda', Currency.GDP, 0, '4087551534272554', '166', '67547d30-8aeb-4a69-8af2-97b71dfdbfda', '3b8cbd4b-2365-4ab1-a907-8e28c75225fb');
        jest.spyOn(cardRepository, 'findCardByNumber').mockReturnValueOnce(Promise.resolve(cardMock)).mockReturnValueOnce(undefined);
        await randomCardGenerator.generateCardNumber();
        expect(cardRepository.findCardByNumber).toHaveBeenCalledTimes(2);
    })
});