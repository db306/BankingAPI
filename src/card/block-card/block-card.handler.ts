import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {BlockCardCommand} from "./block-card.command";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {CardAlreadyBlockedException} from "../exceptions/card-already-blocked.exception";
import {CardBlockedEvent} from "./card-blocked.event";

@CommandHandler(BlockCardCommand)
export class BlockCardHandler implements ICommandHandler<BlockCardCommand>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        private readonly eventBus: EventBus
    ){}

    async execute(command: BlockCardCommand): Promise<void> {

        const card = await this.cardRepository.findById(command.cardId);

        if(!card){
            throw new CardIdDoesNotExistException();
        }

        if(card.userId !== command.userId){
            throw new CardDoesNotBelongToUserException();
        }

        if(card.isBlocked()){
            throw new CardAlreadyBlockedException();
        }

        card.blockCard();

        await this.cardRepository.save(card);
        this.eventBus.publish(new CardBlockedEvent(card.id));
        return;
    }
}