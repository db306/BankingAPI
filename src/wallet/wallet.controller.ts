import { Request } from 'express';
import {Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req} from "@nestjs/common";
import {CreateWalletInput} from "./create-wallet.input";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {AddWalletCommand} from "./add-wallet/add-wallet.command";
import {CreateWalletOutput} from "./create-wallet.output";
import { validate as uuidValidate } from 'uuid';
import {WalletDto} from "./wallet.dto";
import {GetWalletQuery} from "./get-wallet/get-wallet.query";
import {LoadMoneyInput} from "../card/load-money.input";
import {TransferFundsInput} from "./transfer-funds.input";
import {TransferFundsCommand} from "./transfer-funds/transfer-funds.command";

@Controller('wallet')
export class WalletController {

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Post()
    async createWallet(
        @Body() payload: CreateWalletInput,
        @Req() request: Request
    ): Promise<CreateWalletOutput>{
        const companyId = request.header('X-Company-Id');
        if(!uuidValidate(companyId)){
            throw new HttpException('Company Id must be a valid uuid', HttpStatus.BAD_REQUEST);
        }
        const id = await this.commandBus.execute(new AddWalletCommand(payload.balance, payload.currency, companyId));
        return {id};
    }

    @Get()
    async getWallets(
        @Req() request: Request
    ): Promise<WalletDto[]>{
        const companyId = request.header('X-Company-Id');
        if(!uuidValidate(companyId)){
            throw new HttpException('Company Id must be a valid uuid', HttpStatus.BAD_REQUEST);
        }
        return this.queryBus.execute(new GetWalletQuery(companyId));
    }

    @Post(':walletId/transfer')
    async transferWalletFunds(
        @Req() request: Request,
        @Param('walletId') walletId: string,
        @Body() payload: TransferFundsInput
    ): Promise<void>{
        const companyId = request.header('X-Company-Id');
        if(!uuidValidate(companyId)){
            throw new HttpException('Company Id must be a valid uuid', HttpStatus.BAD_REQUEST);
        }
        if(!uuidValidate(walletId)){
            throw new HttpException('Wallet Id must be a valid uuid', HttpStatus.BAD_REQUEST);
        }
        await this.commandBus.execute(new TransferFundsCommand(walletId, payload.destinationWalletId, payload.amount, companyId));
    }
}