import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Card} from "./card";
import {CardController} from "./card.controller";
import {CardRepositoryToken} from "./card-repository.token";
import {TypeormCardRepository} from "./typeorm-card.repository";
import {AddCardHandler} from "./add-card/add-card.handler";
import {Wallet} from "../wallet/wallet";
import {WalletModule} from "../wallet/wallet.module";
import {typeormDbConnection} from "../typeorm-db.connection";
import {RandomCardGenerator} from "./random-card.generator";
import {CardGeneratorToken} from "./card-generator.token";
import {GetCardHandler} from "./get-card/get-card.handler";
import {BlockCardHandler} from "./block-card/block-card.handler";
import {UnblockCardHandler} from "./unblock-card/unblock-card.handler";
import {LoadMoneyHandler} from "./load-money/load-money.handler";
import {UnloadMoneyHandler} from "./unload-money/unload-money.handler";
import {UnloadFundsWhenBlockedListener} from "./unload-money/unload-funds-when-blocked.listener";

const Commands = [
    AddCardHandler,
    BlockCardHandler,
    UnblockCardHandler,
    LoadMoneyHandler,
    UnloadMoneyHandler
];

const Queries = [GetCardHandler];

const EventListeners = [UnloadFundsWhenBlockedListener];

@Module({
    imports: [
        WalletModule,
        CqrsModule,
        TypeOrmModule.forFeature([Card, Wallet], typeormDbConnection)
    ],
    controllers: [CardController],
    providers: [
        RandomCardGenerator,
        {
            provide: CardRepositoryToken,
            useClass: TypeormCardRepository
        },
        {
            provide: CardGeneratorToken,
            useClass: RandomCardGenerator
        },
        ...Commands,
        ...Queries,
        ...EventListeners
    ],
})
export class CardModule{}