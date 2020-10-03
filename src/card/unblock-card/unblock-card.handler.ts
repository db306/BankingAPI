import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {UnblockCardCommand} from "./unblock-card.command";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {CardAlreadyActiveException} from "../exceptions/card-already-active.exception";
import {CardUnblockedEvent} from "./card-unblocked.event";

@CommandHandler(UnblockCardCommand)
export class UnblockCardHandler implements ICommandHandler<UnblockCardCommand>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        private readonly eventBus: EventBus
    ){}

    async execute(command: UnblockCardCommand): Promise<void> {
        const card = await this.cardRepository.findById(command.cardId);

        if(!card){
            throw new CardIdDoesNotExistException();
        }

        if(card.userId !== command.userId){
            throw new CardDoesNotBelongToUserException();
        }

        if(!card.isBlocked()){
            throw new CardAlreadyActiveException();
        }

        card.unblockCard();

        await this.cardRepository.save(card);
        this.eventBus.publish(new CardUnblockedEvent(card.id));
        return;
    }
}