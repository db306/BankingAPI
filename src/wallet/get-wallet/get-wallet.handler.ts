import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetWalletQuery} from "./get-wallet.query";
import {Inject} from "@nestjs/common";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {WalletRepository} from "../wallet.repository";
import {WalletDto} from "../wallet.dto";

@QueryHandler(GetWalletQuery)
export class GetWalletHandler implements IQueryHandler<GetWalletQuery>{

    constructor(
        @Inject(WalletRepositoryToken)
        private readonly repository: WalletRepository
    ) {}

    async execute(query: GetWalletQuery): Promise<WalletDto[]> {
        const wallets = await this.repository.findByCompanyId(query.companyId);
        return wallets.map(wallet => ({id: wallet.id, currentBalance: wallet.currentBalance, currency: wallet.currency, companyId: query.companyId} as WalletDto));
    }
}