import {CommandHandler, EventBus, ICommandHandler} from "@nestjs/cqrs";
import {TransferFundsCommand} from "./transfer-funds.command";
import {Inject} from "@nestjs/common";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {WalletRepository} from "../wallet.repository";
import {Wallet} from "../wallet";
import {FundsTransferedEvent} from "./funds-transfered.event";
import {WalletIdDoesNotExistException} from "../exceptions/wallet-id-does-not-exist.exception";
import {TransfersCannotBeAcrossCompaniesException} from "../exceptions/transfers-cannot-be-across-companies.exception";
import {WalletDoesNotBelongToCompanyException} from "../exceptions/wallet-does-not-belong-to-company.exception";
import {InsufficientFundsInWalletException} from "../../card/exceptions/insufficient-funds-in-wallet.exception";
import {CurrencyConversionToken} from "../currency-conversion.token";
import {CurrencyConversionService} from "../currency-conversion.service";
import {CommissionWalletService} from "../commission-wallet.service";

@CommandHandler(TransferFundsCommand)
export class TransferFundsHandler implements ICommandHandler<TransferFundsCommand>{

    constructor(
        @Inject(WalletRepositoryToken)
        private readonly repository: WalletRepository,
        @Inject(CurrencyConversionToken)
        private readonly converter: CurrencyConversionService,
        private readonly commissionWalletService: CommissionWalletService,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: TransferFundsCommand): Promise<void> {
        let originWallet: Wallet;
        let destinationWallet: Wallet;

        const wallets = await this.repository.findByIds([command.originWalletId, command.destinationWalletId]);

        if(!wallets){
            throw new WalletIdDoesNotExistException();
        }

        if(wallets.length !== 2){
            throw new WalletIdDoesNotExistException();
        }

        if(wallets[0].id === command.originWalletId){
            originWallet = wallets[0];
            destinationWallet = wallets[1];
        }else{
            originWallet = wallets[1];
            destinationWallet = wallets[0];
        }

        if(originWallet.companyId !== command.companyId){
            throw new WalletDoesNotBelongToCompanyException();
        }

        if(originWallet.companyId !== destinationWallet.companyId){
            throw new TransfersCannotBeAcrossCompaniesException();
        }

        if(originWallet.currentBalance < command.amount){
            throw new InsufficientFundsInWalletException();
        }

        let transactionWallets: Wallet[];
        let commission = 0;
        let destinationAmount = command.amount;

        if(originWallet.currency === destinationWallet.currency){
            originWallet.unloadMoney(command.amount);
            destinationWallet.loadMoney(command.amount);
            transactionWallets = [originWallet, destinationWallet];
        }else{

            const commissionWallet = await this.commissionWalletService.getCommissionWallet(destinationWallet.currency);
            const conversion = await this.converter.convert(originWallet.currency, destinationWallet.currency, command.amount);
            commission = Math.round(conversion * 0.029);
            destinationAmount = conversion-commission;
            originWallet.unloadMoney(command.amount);
            destinationWallet.loadMoney(destinationAmount);
            commissionWallet.loadMoney(commission);
            transactionWallets = [originWallet, destinationWallet, commissionWallet];
        }

        await this.repository.save(transactionWallets);

        this.eventBus.publish(new FundsTransferedEvent(
            originWallet.id,
            destinationWallet.id,
            originWallet.currency,
            destinationWallet.currency,
            command.amount,
            destinationAmount,
            commission,
            new Date()
        ));
    }
}