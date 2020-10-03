import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {AddCardCommand} from "./add-card.command";
import {Inject} from "@nestjs/common";
import {CardRepository} from "../card.repository";
import {CardRepositoryToken} from "../card-repository.token";
import {WalletRepositoryToken} from "../../wallet/wallet-repository.token";
import {WalletRepository} from "../../wallet/wallet.repository";
import {WalletIdDoesNotExistException} from "../../wallet/exceptions/wallet-id-does-not-exist.exception";
import {Card} from "../card";
import * as uuid from 'uuid';
import {RandomCardGenerator} from "../random-card.generator";
import {CardAddedEvent} from "./card-added.event";
import {CardGeneratorToken} from "../card-generator.token";

@CommandHandler(AddCardCommand)
export class AddCardHandler implements ICommandHandler<AddCardCommand> {

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        @Inject(WalletRepositoryToken)
        private readonly walletRepository: WalletRepository,
        @Inject(CardGeneratorToken)
        private readonly cardGenerator: RandomCardGenerator,
        private readonly eventBus: EventBus
    ) {
    }

    async execute(command: AddCardCommand): Promise<any> {

        const wallet = await this.walletRepository.findById(command.walletId);

        if (!wallet) {
            throw new WalletIdDoesNotExistException();
        }

        const id = uuid.v4();
        const cardNumbers = await this.cardGenerator.generateCardNumber();
        const card = new Card(
            id,
            wallet.currency,
            0,
            cardNumbers.number,
            cardNumbers.ccv,
            command.userId,
            wallet.id
        );

        await this.cardRepository.save(card);
        this.eventBus.publish(new CardAddedEvent(id,command.userId, wallet.companyId, wallet.id));
        return id;
    }
}