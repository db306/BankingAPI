import {Inject, Injectable} from "@nestjs/common";
import {WalletRepositoryToken} from "./wallet-repository.token";
import {WalletRepository} from "./wallet.repository";
import {Currency} from "../currency";
import {Wallet} from "./wallet";
import * as uuid from 'uuid';


@Injectable()
export class CommissionWalletService{

    constructor(
        @Inject(WalletRepositoryToken)
        private readonly repository: WalletRepository
    ) {}

    async getCommissionWallet(currency: Currency): Promise<Wallet>{
        let wallet = await this.repository.findCommissionWallet(currency);

        if(!wallet){
            wallet = new Wallet(
                uuid.v4(),
                0,
                currency,
                'f4ac70c6-b017-4d15-b50b-5acfe469f8b1'
            );

            wallet.master = true;
            await this.repository.save([wallet]);
        }
        return wallet;
    }
}