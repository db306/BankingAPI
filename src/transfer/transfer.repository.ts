import {Transfer} from "./transfer";

export interface TransferRepository{
    save(transfer: Transfer): Promise<void>;
}