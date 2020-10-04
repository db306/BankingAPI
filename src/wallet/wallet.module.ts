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
import {TransferFundsHandler} from "./transfer-funds/transfer-funds.handler";
import {CurrencyConversionToken} from "./currency-conversion.token";
import {XratesCurrencyConversionService} from "./xrates-currency-conversion.service";
import {CommissionWalletService} from "./commission-wallet.service";

const Commands = [AddWalletHandler, TransferFundsHandler];
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
        {
            provide: CurrencyConversionToken,
            useClass: XratesCurrencyConversionService
        },
        CommissionWalletService,
        ...Commands,
        ...Queries
    ],
    exports: [WalletRepositoryToken]
})
export class WalletModule{}