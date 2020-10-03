import {Test} from "@nestjs/testing";
import {WalletModule} from "../src/wallet/wallet.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import * as request from 'supertest';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Wallet} from "../src/wallet/wallet";
import {isUUID} from "class-validator";
import {Currency} from "../src/currency";

describe('Wallet', () => {
    describe('/POST Wallet', () => {
        let app: INestApplication;
        beforeAll(async () => {
            const module = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot({
                        type: 'sqlite',
                        database: ':memory:',
                        dropSchema: true,
                        entities: [Wallet],
                        synchronize: true,
                        logging: false
                    }),
                    WalletModule
                ]
            }).compile();
            app = module.createNestApplication();
            app.useGlobalPipes(new ValidationPipe());
            await app.init();
        });

        it('/POST wallet with valid data should return a UUID', async () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "EUR"})
                .expect(201)
                .expect(res => expect(isUUID(res.body.id)).toBeTruthy());
        });

        it('/POST wallet should accept GDP', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "GDP"})
                .expect(201)
                .then(response => expect(isUUID(response.body.id)).toBeTruthy());
        });

        it('/POST wallet should accept USD', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "GDP"})
                .expect(201)
                .then(response => expect(isUUID(response.body.id)).toBeTruthy());
        });

        it('/POST with invalid companyID should return 400 error', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', 'invaliduuid')
                .send({balance: 10000, currency: "EUR"})
                .expect(400, {
                    statusCode: 400,
                    message: "Company Id must be a valid uuid"
                })
        })

        it('/POST with a wallet balance under 0 should return a 400 with an error', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: -10000, currency: "EUR"})
                .expect(400, {
                    statusCode: 400,
                    message: [
                        "balance must not be less than 0"
                    ],
                    error: "Bad Request"
                })
        })

        it('/POST with a wallet currency other than EUR, USD or GDP', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "TES"})
                .expect(400, {
                    statusCode: 400,
                    message: [
                        "currency must be a valid enum value"
                    ],
                    error: "Bad Request"
                })
        })

        afterAll(async () => {
            await app.close();
        });
    })

    describe('/GET Wallet', () => {
        let app: INestApplication;
        beforeAll(async () => {
            const module = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot({
                        type: 'sqlite',
                        database: ':memory:',
                        dropSchema: true,
                        entities: [Wallet],
                        synchronize: true,
                        logging: false
                    }),
                    WalletModule
                ]
            }).compile();
            app = module.createNestApplication();
            app.useGlobalPipes(new ValidationPipe());
            await app.init();
        });

        it('should return data when invoked', async () => {

            const companyId = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
            const currency = Currency.GDP;
            const balance = 2345;

            const addWallet = await request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', companyId)
                .send({balance: balance, currency: currency})
                .expect(201);

            const walletId = addWallet.body.id;

            return request(app.getHttpServer())
                .get('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .expect(200,
                    [{
                        id: walletId,
                        currentBalance: balance,
                        currency: currency,
                        companyId: companyId
                    }]);
        });

        afterAll(async () => {
            await app.close();
        });
    })
})