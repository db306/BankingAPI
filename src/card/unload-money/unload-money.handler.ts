import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {UnloadMoneyCommand} from "./unload-money.command";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {WalletRepositoryToken} from "../../wallet/wallet-repository.token";
import {WalletRepository} from "../../wallet/wallet.repository";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {OrphanCardException} from "../exceptions/orphan-card.exception";
import {InsufficientFundsInCardException} from "../exceptions/insufficient-funds-in-card.exception";
import {FundsTransferFailedException} from "../exceptions/funds-transfer-failed.exception";
import {MoneyUnloadedEvent} from "./money-unloaded.event";

@CommandHandler(UnloadMoneyCommand)
export class UnloadMoneyHandler implements ICommandHandler<UnloadMoneyCommand>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        @Inject(WalletRepositoryToken)
        private readonly walletRepository: WalletRepository,
        private readonly eventBus: EventBus
    ) {
    }

    async execute(command: UnloadMoneyCommand): Promise<void> {
        const card = await this.cardRepository.findById(command.cardId);

        if(!card){
            throw new CardIdDoesNotExistException();
        }

        if(card.userId !== command.userId){
            throw new CardDoesNotBelongToUserException();
        }

        const wallet = await this.walletRepository.findById(card.walletId);

        if(!wallet){
            throw new OrphanCardException();
        }

        if(card.currentBalance < command.amount){
            throw new InsufficientFundsInCardException();
        }

        card.unloadMoney(command.amount);
        wallet.loadMoney(command.amount);

        try{
            await this.cardRepository.saveInSingleTransaction(card, wallet);
        }catch (e){
            console.log(e);
            throw new FundsTransferFailedException();
        }

        this.eventBus.publish(new MoneyUnloadedEvent(command.amount, card.id));
        return;
    }
}