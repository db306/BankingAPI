import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Wallet} from "./wallet";
import {WalletController} from "./wallet.controller";
import {WalletRepositoryToken} from "./wallet-repository.token";
import {TypeormWalletRepository} from "./typeorm-wallet.repository";
import {AddWalletHandler} from "./add-wallet/add-wallet.handler";
import {GetWalletHandler} from "./get-wallet/get-wallet.handler";
import {typeormDbConnection} from "../typeorm-db.connection";

const Commands = [AddWalletHandler];
const Queries = [GetWalletHandler];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Wallet], typeormDbConnection)
    ],
    controllers: [WalletController],
    providers: [
        {
            provide: WalletRepositoryToken,
            useClass: TypeormWalletRepository
        },
        ...Commands,
        ...Queries
    ],
    exports: [WalletRepositoryToken]
})
export class WalletModule{}