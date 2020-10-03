import {Body, Controller, Get, HttpException, Param, Post, Req} from "@nestjs/common";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Request} from "express";
import {CreateCardInput} from "./create-card.input";
import {CreateCardOutput} from "./create-card.output";
import {AddCardCommand} from "./add-card/add-card.command";
import { validate as uuidValidate } from 'uuid';
import {CardDto} from "./card.dto";
import {GetCardQuery} from "./get-card/get-card.query";
import {BlockCardCommand} from "./block-card/block-card.command";
import {UnblockCardCommand} from "./unblock-card/unblock-card.command";
import {LoadMoneyCommand} from "./load-money/load-money.command";
import {LoadMoneyInput} from "./load-money.input";
import {UnloadMoneyCommand} from "./unload-money/unload-money.command";
@Controller('card')
export class CardController {

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Post()
    async createCard(
        @Body() payload: CreateCardInput,
        @Req() request: Request
    ): Promise<CreateCardOutput>{
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        const id = await this.commandBus.execute(new AddCardCommand(payload.walletId, userId));
        return {id};
    }

    @Get()
    async getCards(
        @Req() request: Request
    ): Promise<CardDto[]> {
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        return this.queryBus.execute(new GetCardQuery(userId));
    }

    @Post(':cardId/block')
    async blockCard(
        @Req() request: Request,
        @Param('cardId') cardId: string
    ): Promise<void>{
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        await this.commandBus.execute(new BlockCardCommand(cardId, userId));
    }

    @Post(':cardId/unblock')
    async unblockCard(
        @Req() request: Request,
        @Param('cardId') cardId: string
    ): Promise<void>{
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        await this.commandBus.execute(new UnblockCardCommand(cardId, userId));
    }

    @Post(':cardId/load')
    async loadMoneyToCard(
        @Req() request: Request,
        @Param('cardId') cardId: string,
        @Body() payload: LoadMoneyInput,
    ): Promise<void>{
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        await this.commandBus.execute(new LoadMoneyCommand(userId, cardId, payload.amount))
    }

    @Post(':cardId/unload')
    async unloadMoneyToCard(
        @Req() request: Request,
        @Param('cardId') cardId: string,
        @Body() payload: LoadMoneyInput,
    ): Promise<void>{
        const userId = request.header('X-User-Id');
        if(!uuidValidate(userId)){
            throw new HttpException('User Id must be a valid uuid', 400);
        }
        await this.commandBus.execute(new UnloadMoneyCommand(userId, cardId, payload.amount))
    }
}