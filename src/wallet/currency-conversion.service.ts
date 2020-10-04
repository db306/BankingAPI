import {Currency} from "../currency";

export interface CurrencyConversionService{
    convert(origin: Currency, destination: Currency, amount: number): Promise<number>;
}