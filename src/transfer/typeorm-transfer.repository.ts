import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Transfer} from "./transfer";
import {typeormDbConnection} from "../typeorm-db.connection";
import {Repository} from "typeorm";
import {TransferRepository} from "./transfer.repository";

@Injectable()
export class TypeormTransferRepository implements TransferRepository{
    constructor(
        @InjectRepository(Transfer, typeormDbConnection)
        private readonly repository: Repository<Transfer>
    ) {}

    async save(transfer: Transfer): Promise<void> {
        await this.repository.save(transfer);
        return;
    }
}