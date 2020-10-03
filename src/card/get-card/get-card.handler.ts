import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCardQuery} from "./get-card.query";
import {CardDto} from "../card.dto";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";

@QueryHandler(GetCardQuery)
export class GetCardHandler implements IQueryHandler<GetCardQuery>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
    ) {}

    async execute(query: GetCardQuery): Promise<CardDto[]> {
        const cards = await this.cardRepository.findCardsByUserId(query.userId);
        return cards.map(card => ({...card} as CardDto));
    }
}