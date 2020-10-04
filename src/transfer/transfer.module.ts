import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Transfer} from "./transfer";
import {typeormDbConnection} from "../typeorm-db.connection";
import {TransferRepositoryToken} from "./transfer-repository.token";
import {TypeormTransferRepository} from "./typeorm-transfer.repository";
import {RecordTransferHandler} from "./record-transfer/record-transfer.handler";
import {CardLoadedTransferListener} from "./record-transfer/card-loaded-transfer.listener";
import {CardUnloadedTransferListener} from "./record-transfer/card-unloaded-transfer.listener";
import {WalletFundTransferListener} from "./record-transfer/wallet-fund-transfer.listener";

const Commands = [RecordTransferHandler];
const EventListeners = [CardLoadedTransferListener, CardUnloadedTransferListener, WalletFundTransferListener];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([Transfer], typeormDbConnection)
    ],
    providers: [
        {
            provide: TransferRepositoryToken,
            useClass: TypeormTransferRepository
        },
        ...Commands,
        ...EventListeners
    ]
})
export class TransferModule{}