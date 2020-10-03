import {Test} from "@nestjs/testing";
import {WalletRepositoryToken} from "../wallet-repository.token";
import {GetWalletHandler} from "./get-wallet.handler";
import {WalletRepository} from "../wallet.repository";
import {GetWalletQuery} from "./get-wallet.query";
import {Wallet} from "../wallet";
import {WalletDto} from "../wallet.dto";
import {Currency} from "../../currency";

describe('Get my wallets', () => {
    let walletRepository: WalletRepository,
        getWalletHandler: GetWalletHandler;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: WalletRepositoryToken,
                    useValue: {
                        findByCompanyId: jest.fn()
                    }
                },
                GetWalletHandler
            ]
        }).compile();
        walletRepository = module.get<WalletRepository>(WalletRepositoryToken);
        getWalletHandler = module.get<GetWalletHandler>(GetWalletHandler);
    });

    describe('when requesting my wallets', () => {
        const query = new GetWalletQuery('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e');

        it('should get wallets', async () => {
            jest.spyOn(walletRepository, 'findByCompanyId')
                .mockImplementation( () => Promise.resolve(
                    [
                        new Wallet('26617610-7471-45fb-a0a7-d94da2f6eb38', 4567, Currency.EUR, '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e'),
                        new Wallet('abfe0a05-f515-4c3f-92d3-c016a62fd700', 2345, Currency.USD, '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0e')
                    ]
                ));
            const wallets = await getWalletHandler.execute(query);
            expect(wallets.length).toEqual(2)
        });
    })

})