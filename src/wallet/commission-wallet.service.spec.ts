import {Test} from "@nestjs/testing";
import {WalletRepositoryToken} from "./wallet-repository.token";
import {CommissionWalletService} from "./commission-wallet.service";
import {WalletRepository} from "./wallet.repository";
import * as uuid from 'uuid';
import {Wallet} from "./wallet";
import {Currency} from "../currency";

jest.mock('uuid', () => {
    return {
        v4: () => ''
    };
});

describe('Commission Wallet Service', () => {

    let commissionWalletService: CommissionWalletService,
        repository: WalletRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: WalletRepositoryToken,
                    useValue: {
                        findCommissionWallet: jest.fn(),
                        save: jest.fn()
                    }
                },
                CommissionWalletService
            ]
        }).compile();

        repository = module.get<WalletRepository>(WalletRepositoryToken);
        commissionWalletService = module.get<CommissionWalletService>(CommissionWalletService)
    });

    const currency = Currency.EUR;
    const companyId = 'f4ac70c6-b017-4d15-b50b-5acfe469f8b1';
    const walletId = 'f4ac70c6-b017-4d15-b50b-5acfe469f8b2';
    (uuid.v4 as any) = () => walletId;
    const mockWallet = new Wallet(walletId, 0, currency, companyId);

    it('should return wallet if found', async() => {
        jest.spyOn(repository, 'findCommissionWallet').mockResolvedValue(mockWallet);
        const result = await commissionWalletService.getCommissionWallet(currency);
        expect(result).toEqual(mockWallet);
    });

    it('should generate a new wallet if not found', async () => {
        jest.spyOn(repository, 'findCommissionWallet').mockResolvedValue(undefined);
        await commissionWalletService.getCommissionWallet(currency);
        mockWallet.master = true;
        expect(repository.save).toHaveBeenCalledWith([mockWallet]);
    })
})