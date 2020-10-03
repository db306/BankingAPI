import {Card} from "./card";
import {Wallet} from "../wallet/wallet";

export interface CardRepository {
    save(card: Card): Promise<void>;
    findCardByNumber(cardNumber: string): Promise<Card|undefined>;
    findCardsByUserId(userId: string): Promise<Card[]>;
    findById(cardId: string): Promise<Card|undefined>;
    saveInSingleTransaction(card: Card, wallet: Wallet): Promise<void>;
}