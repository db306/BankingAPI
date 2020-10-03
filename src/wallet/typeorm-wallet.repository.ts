import {Injectable} from "@nestjs/common";
import {WalletRepository} from "./wallet.repository";
import {Wallet} from "./wallet";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {typeormDbConnection} from "../typeorm-db.connection";

@Injectable()
export class TypeormWalletRepository implements WalletRepository{

    constructor(
        @InjectRepository(Wallet, typeormDbConnection)
        private readonly repository: Repository<Wallet>
    ) {}

    async save(wallet: Wallet): Promise<void> {
        await this.repository.save(wallet);
        return;
    }

    findByCompanyId(companyId: string): Promise<Wallet[]> {
        return this.repository.find({companyId: companyId});
    }

    findById(walletId: string): Promise<Wallet | undefined> {
        return this.repository.findOne({id: walletId});
    }
}