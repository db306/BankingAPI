import {Wallet} from "./wallet";

export interface WalletRepository{
    save(wallet: Wallet): Promise<void>;
    findByCompanyId(companyId: string): Promise<Wallet[]>;
    findById(walletId: string): Promise<Wallet|undefined>
}