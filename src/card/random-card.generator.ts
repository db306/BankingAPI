import {Inject, Injectable} from "@nestjs/common";
import {GenCC} from 'creditcard-generator';
import {CardVo} from "./card.vo";
import {CardRepositoryToken} from "./card-repository.token";
import {CardRepository} from "./card.repository";
import {CardGenerator} from "./card.generator";

@Injectable()
export class RandomCardGenerator implements CardGenerator{
    constructor(
        @Inject(CardRepositoryToken)
        private readonly cardRepository: CardRepository
    ) {}

    async generateCardNumber(): Promise<CardVo>{

        let number = this.getCardNumber();

        while(await this.cardRepository.findCardByNumber(number) !== undefined){
            number = this.getCardNumber();
        }

        return {
            number,
            ccv: this.getRandomCCV()
        } as CardVo;
    }

    private getCardNumber(): string{
        return GenCC("VISA")[0];
    }

    private getRandomCCV(): string{
        let ccv = '';
        for (let i = 0; i<3; i++){
            ccv += Math.floor(Math.random() * Math.floor(9));
        }
        return ccv;
    }
}