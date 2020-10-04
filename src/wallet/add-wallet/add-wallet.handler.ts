import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {AddWalletCommand} from "./add-wallet.command";
import * as uuid from 'uuid';
import {Wallet} from "../wallet";
import {WalletAddedEvent} from "./wallet-added.event";
import {Inject} from "@nestjs/common";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {WalletRepository} from "../wallet.repository";

@CommandHandler(AddWalletCommand)
export class AddWalletHandler implements ICommandHandler<AddWalletCommand>{

    constructor(
        @Inject(WalletRepositoryToken)
        private readonly repository: WalletRepository,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: AddWalletCommand): Promise<string>{
        const id = uuid.v4();
        const wallet = new Wallet(id, command.balance, command.currency, command.companyId);
        await this.repository.save([wallet]);
        this.eventBus.publish(new WalletAddedEvent(id, command.balance, command.currency, command.companyId));
        return id;
    }

}