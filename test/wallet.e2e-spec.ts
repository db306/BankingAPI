import {Test} from "@nestjs/testing";
import {WalletModule} from "../src/wallet/wallet.module";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import * as request from 'supertest';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Wallet} from "../src/wallet/wallet";
import {isUUID} from "class-validator";
import {typeormDbConnection} from "../src/typeorm-db.connection";

describe('Wallet', () => {
    describe('/POST Wallet', () => {
        let app: INestApplication;
        let server: any;
        beforeAll(async () => {
            const module = await Test.createTestingModule({
                imports: [
                    TypeOrmModule.forRoot({
                        name: typeormDbConnection,
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
            server = app.getHttpServer();
        });

        it('POST wallet with valid data should return a UUID and should be able to GET it back', async () => {
            const result = await request(server)
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "EUR"})
                .expect(201)
                .expect(res => expect(isUUID(res.body.id)).toBeTruthy());

            return request(server)
                .get('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .expect(200)
        });

        it('/POST wallet should accept GBP', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "GBP"})
                .expect(201)
                .then(response => expect(isUUID(response.body.id)).toBeTruthy());
        });

        it('/POST wallet should accept USD', () => {
            return request(app.getHttpServer())
                .post('/wallet')
                .set('X-Company-Id', '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b')
                .send({balance: 10000, currency: "GBP"})
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

        it('/POST with a wallet currency other than EUR, USD or GBP', () => {
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
})