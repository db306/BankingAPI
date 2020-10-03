import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {LoadMoneyCommand} from "./load-money.command";
import {Inject} from "@nestjs/common";
import {CardRepositoryToken} from "../card-repository.token";
import {CardRepository} from "../card.repository";
import {WalletRepositoryToken} from "../../wallet/wallet-repository.token";
import {WalletRepository} from "../../wallet/wallet.repository";
import {CardIdDoesNotExistException} from "../exceptions/card-id-does-not-exist.exception";
import {CardDoesNotBelongToUserException} from "../exceptions/card-does-not-belong-to-user.exception";
import {MoneyLoadedEvent} from "./money-loaded.event";
import {OrphanCardException} from "../exceptions/orphan-card.exception";
import {InsufficientFundsInWalletException} from "../exceptions/insufficient-funds-in-wallet.exception";
import {FundsTransferFailedException} from "../exceptions/funds-transfer-failed.exception";

@CommandHandler(LoadMoneyCommand)
export class LoadMoneyHandler implements ICommandHandler<LoadMoneyCommand>{

    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository,
        @Inject(WalletRepositoryToken)
        private readonly walletRepository: WalletRepository,
        private readonly eventBus: EventBus
    ) {
    }

    async execute(command: LoadMoneyCommand): Promise<void> {
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

        if(wallet.currentBalance < command.amount){
            throw new InsufficientFundsInWalletException();
        }

        card.loadMoney(command.amount as number);
        wallet.unloadMoney(command.amount as number);

        try{
            await this.cardRepository.saveInSingleTransaction(card, wallet);
        }catch (e){
            throw new FundsTransferFailedException();
        }

        this.eventBus.publish(new MoneyLoadedEvent(command.amount, card.id));
        return;
    }
}