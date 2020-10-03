import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Card} from "./card/card";
import {Wallet} from "./wallet/wallet";
import {Transfer} from "./transfer/transfer";
import {WalletModule} from "./wallet/wallet.module";
import {CardModule} from "./card/card.module";
import {typeormDbConnection} from "./typeorm-db.connection";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            name: typeormDbConnection,
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'USER',
            password: 'PASSWORD',
            database: 'DB',
            entities: [Card, Wallet, Transfer],
            synchronize: true,
        }),
        WalletModule,
        CardModule
    ]
})
export class AppModule {}
