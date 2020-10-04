import {Test} from "@nestjs/testing";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {CurrencyConversionToken} from "../currency-conversion.token";
import {CommissionWalletService} from "../commission-wallet.service";
import {EventBus} from "@nestjs/cqrs";
import {TransferFundsHandler} from "./transfer-funds.handler";
import {WalletRepository} from "../wallet.repository";
import {CurrencyConversionService} from "../currency-conversion.service";
import {Currency} from "../../currency";
import {TransferFundsCommand} from "./transfer-funds.command";
import {WalletIdDoesNotExistException} from "../exceptions/wallet-id-does-not-exist.exception";
import {Wallet} from "../wallet";
import {WalletDoesNotBelongToCompanyException} from "../exceptions/wallet-does-not-belong-to-company.exception";
import {TransfersCannotBeAcrossCompaniesException} from "../exceptions/transfers-cannot-be-across-companies.exception";
import {InsufficientFundsInWalletException} from "../../card/exceptions/insufficient-funds-in-wallet.exception";
import {FundsTransferedEvent} from "./funds-transfered.event";

describe('Transfer Funds', () => {

    const originWalletId = 'ebf6dc0f-53c7-4fbe-9676-d3e4b8f9aa7e';
    const destinationWalletId = '6050726e-fc5c-4778-90a1-9175af09b647';
    const originBalance = 1000;
    const destinationBalance = 1000;
    const transactionAmount = 500;
    const currency = Currency.EUR;
    const companyId = '705376bc-db17-4341-a543-f849a163db99';
    const command = new TransferFundsCommand(originWalletId, destinationWalletId, transactionAmount, companyId);

    let originWalletMock: Wallet,
        destWalletMock: Wallet;

    let repository: WalletRepository,
        converter: CurrencyConversionService,
        commissionWalletService: CommissionWalletService,
        eventBus: EventBus,
        transferFundsHandler: TransferFundsHandler;

    beforeEach(async() => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: WalletRepositoryToken,
                    useValue: {
                        findByIds: jest.fn(),
                        save: jest.fn()
                    }
                },
                {
                    provide: CurrencyConversionToken,
                    useValue: {
                        convert: jest.fn()
                    }
                },
                {
                    provide: CommissionWalletService,
                    useValue: {
                        getCommissionWallet: jest.fn()
                    }
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn()
                    }
                },
                TransferFundsHandler
            ]
        }).compile();

        repository = module.get<WalletRepository>(WalletRepositoryToken);
        converter = module.get<CurrencyConversionService>(CurrencyConversionToken);
        commissionWalletService = module.get<CommissionWalletService>(CommissionWalletService);
        eventBus = module.get<EventBus>(EventBus);
        transferFundsHandler = module.get<TransferFundsHandler>(TransferFundsHandler);

        originWalletMock = new Wallet(originWalletId, originBalance, currency, companyId);
        destWalletMock = new Wallet(destinationWalletId, destinationBalance, currency, companyId);

    })

    describe('when transfering funds from currency to currency', () => {

        it('should throw an exception if one of the wallets is not found', async ()=> {
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock]);
            await expect(transferFundsHandler.execute(command)).rejects.toBeInstanceOf(WalletIdDoesNotExistException);
        });

        it('should throw an exception if none of the wallets is found', async ()=> {
            jest.spyOn(repository, 'findByIds').mockResolvedValue(undefined);
            await expect(transferFundsHandler.execute(command)).rejects.toBeInstanceOf(WalletIdDoesNotExistException);
        });

        it('should throw an exception if the wallet does not belong to the user', async ()=> {
            originWalletMock.companyId = '705376bc-db17-4341-a543-f849a163db98';
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await expect(transferFundsHandler.execute(command)).rejects.toBeInstanceOf(WalletDoesNotBelongToCompanyException);
        });

        it('should throw an exception if both wallets do not belong to the same company', async ()=> {
            destWalletMock.companyId = '705376bc-db17-4341-a543-f849a163db98';
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await expect(transferFundsHandler.execute(command)).rejects.toBeInstanceOf(TransfersCannotBeAcrossCompaniesException);
        });

        it('should throw an exception if the balance of the origin account is smaller than the amount transfered', async ()=> {
            originWalletMock.currentBalance = 400;
            jest.spyOn(repository, 'findByIds').mockResolvedValue([destWalletMock, originWalletMock]);
            await expect(transferFundsHandler.execute(command)).rejects.toBeInstanceOf(InsufficientFundsInWalletException);
        });

        it('should save wallets with the updated amounts', async ()=> {
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await transferFundsHandler.execute(command);
            originWalletMock.currentBalance -= command.amount;
            destWalletMock.currentBalance += command.amount;
            expect(repository.save).toHaveBeenCalledWith([originWalletMock, destWalletMock]);
        });
        it('should dispatch an event', async ()=> {
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await transferFundsHandler.execute(command);
            expect(eventBus.publish).toHaveBeenCalledWith(
                new FundsTransferedEvent(
                    originWalletId,
                    destinationWalletId,
                    currency,
                    currency,
                    command.amount,
                    command.amount,
                    0,
                    expect.any(Date)
                )
            )
        });
    })

    describe('when transfering funds from one currency to another', () => {
        it('should get Spendesk commission wallet', async () => {
            destWalletMock.currency = Currency.USD;
            const commissionWallet = new Wallet('705376bc-db17-4341-a543-f849a163db99', 0, Currency.USD, 'f4ac70c6-b017-4d15-b50b-5acfe469f8b1');
            jest.spyOn(commissionWalletService, 'getCommissionWallet').mockResolvedValue(commissionWallet);
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await transferFundsHandler.execute(command);
            expect(converter.convert).toHaveBeenCalledWith(currency, Currency.USD, command.amount);
        });

        it('should convert the amount to move from wallet to wallet', async ()=> {
            destWalletMock.currency = Currency.USD;
            const commissionWallet = new Wallet('705376bc-db17-4341-a543-f849a163db99', 0, Currency.USD, 'f4ac70c6-b017-4d15-b50b-5acfe469f8b1');
            jest.spyOn(commissionWalletService, 'getCommissionWallet').mockResolvedValue(commissionWallet);
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            await transferFundsHandler.execute(command);
            expect(commissionWalletService.getCommissionWallet).toHaveBeenCalledWith(Currency.USD);
        });

        it('should update balances of all 3 wallets and save', async ()=> {
            destWalletMock.currency = Currency.USD;
            const commissionWallet = new Wallet('705376bc-db17-4341-a543-f849a163db99', 0, Currency.USD, 'f4ac70c6-b017-4d15-b50b-5acfe469f8b1');
            jest.spyOn(commissionWalletService, 'getCommissionWallet').mockResolvedValue(commissionWallet);
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            jest.spyOn(converter, 'convert').mockResolvedValue(550);
            const commission = Math.round(550 * 0.029);
            originWalletMock.currentBalance -= command.amount;
            destWalletMock.currentBalance += 550 - commission;
            commissionWallet.currentBalance = commission;

            await transferFundsHandler.execute(command);
            expect(repository.save).toHaveBeenCalledWith([originWalletMock, destWalletMock, commissionWallet]);
        });

        it('should dispatch an event', async ()=> {
            destWalletMock.currency = Currency.USD;
            const commissionWallet = new Wallet('705376bc-db17-4341-a543-f849a163db99', 0, Currency.USD, 'f4ac70c6-b017-4d15-b50b-5acfe469f8b1');
            jest.spyOn(commissionWalletService, 'getCommissionWallet').mockResolvedValue(commissionWallet);
            jest.spyOn(repository, 'findByIds').mockResolvedValue([originWalletMock, destWalletMock]);
            jest.spyOn(converter, 'convert').mockResolvedValue(550);
            const commission = Math.round(550 * 0.029);
            const destinationAmount = 550 - commission;
            originWalletMock.currentBalance -= command.amount;
            destWalletMock.currentBalance += destinationAmount;
            commissionWallet.currentBalance = commission;

            await transferFundsHandler.execute(command);
            expect(eventBus.publish).toHaveBeenCalledWith(
                new FundsTransferedEvent(
                    originWalletId,
                    destinationWalletId,
                    currency,
                    Currency.USD,
                    command.amount,
                    destinationAmount,
                    commission,
                    expect.any(Date)
                )
            );
        });
    });
});