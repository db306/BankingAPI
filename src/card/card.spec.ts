import {Card} from "./card";
import {Currency} from "../currency";

describe('Card', () => {

    const userId = '67547d30-8aeb-4a69-8af2-97b71dfdbfda';
    const cardId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';
    const balance = 1000;
    const currency = Currency.GBP;
    const cardNumber = '4087551534272554';
    const ccv = '166';
    const walletId = '3b8cbd4b-2365-4ab1-a907-8e28c75225fb';

    it('should set status to true when creating a card', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        expect(cardMock.status).toBeTruthy()
    })

    it('should set expiration date to one month ahead', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        const currentMonth = new Date().getMonth();
        const expirationMonth = cardMock.expirationDate.getMonth();
        expect([1,-11].includes(expirationMonth - currentMonth)).toBeTruthy();
    })

    it('should set constructor parameters', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        expect(cardMock.id).toEqual(cardId);
        expect(cardMock.currency).toEqual(currency);
        expect(cardMock.currentBalance).toEqual(balance);
        expect(cardMock.number).toEqual(cardNumber);
        expect(cardMock.ccv).toEqual(ccv);
        expect(cardMock.userId).toEqual(userId);
        expect(cardMock.walletId).toEqual(walletId);
    })

    it('should set status to false when blocking a card', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        cardMock.blockCard();
        expect(cardMock.status).toBeFalsy();
    })

    it('should return status of the card when incoking isBlocked()', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        expect(cardMock.isBlocked()).toBeFalsy();
        cardMock.blockCard();
        expect(cardMock.isBlocked()).toBeTruthy();
    })

    it('should set status to true when unblocking the card', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        cardMock.status = false;
        cardMock.unblockCard();
        expect(cardMock.status).toBeTruthy();
    })

    it('should add amount to current balance when adding funds', () => {
        const cardMock = new Card(cardId, currency, 1, cardNumber, ccv, userId, walletId);
        const amountToAdd = 1;
        cardMock.loadMoney(amountToAdd);
        expect(cardMock.currentBalance).toEqual(2);
    })

    it('should substract amount from current balance when substracting funds', () => {
        const cardMock = new Card(cardId, currency, balance, cardNumber, ccv, userId, walletId);
        const amountToSubstract = 300;
        cardMock.unloadMoney(amountToSubstract);
        expect(cardMock.currentBalance).toEqual((balance-amountToSubstract));
    })
})