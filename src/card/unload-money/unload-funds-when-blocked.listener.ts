import {CommandBus, EventsHandler, IEventHandler} from "@nestjs/cqrs";
import {CardBlockedEvent} from "../block-card/card-blocked.event";
import {UnloadMoneyCommand} from "./unload-money.command";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardIsActiveException} from "../exceptions/card-is-active.exception";

@EventsHandler(CardBlockedEvent)
export class UnloadFundsWhenBlockedListener implements IEventHandler<CardBlockedEvent>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        private readonly commandBus: CommandBus
    ) {}

    async handle(event: CardBlockedEvent): Promise<void> {

        const card = await this.cardRepository.findById(event.cardId);

        if(!card){
            throw new CardIdDoesNotExistException();
        }

        if(!card.isBlocked()){
            throw new CardIsActiveException();
        }

        await this.commandBus.execute(new UnloadMoneyCommand(card.userId, card.id, card.currentBalance));
        return;
    }
}