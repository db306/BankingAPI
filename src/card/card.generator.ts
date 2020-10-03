import {CardVo} from "./card.vo";

export interface CardGenerator{
    generateCardNumber(): Promise<CardVo>;
}