import {CardRepository} from "./card.repository";
import {Injectable} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {Connection, Repository} from "typeorm";
import {Card} from "./card";
import {typeormDbConnection} from "../typeorm-db.connection";
import {Wallet} from "../wallet/wallet";

@Injectable()
export class TypeormCardRepository implements CardRepository{
    constructor(
        @InjectRepository(Card, typeormDbConnection)
        private readonly repository: Repository<Card>,
        @InjectConnection(typeormDbConnection)
        private connection: Connection
    ) {}

    async save(card: Card): Promise<void> {
        await this.repository.save(card);
        return;
    }

    findCardByNumber(cardNumber: string): Promise<Card | undefined> {
        return this.repository.findOne({number: cardNumber});
    }

    findCardsByUserId(userId: string): Promise<Card[]> {
        return this.repository.find({userId: userId});
    }

    findById(cardId: string): Promise<Card | undefined> {
        return this.repository.findOne(cardId);
    }

    async saveInSingleTransaction(card: Card, wallet: Wallet): Promise<void> {
        await this.connection.transaction(async em => {
            await em.save<Card>(card);
            await em.save<Wallet>(wallet);
        });
        return;
    }
}