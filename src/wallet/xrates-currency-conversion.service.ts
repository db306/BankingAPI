import {CurrencyConversionService} from "./currency-conversion.service";
import {Currency} from "../currency";
import {Injectable} from "@nestjs/common";
import * as ExchangeRates from "exchange-rates-api"
import {CouldNotConvertCurrenciesException} from "./exceptions/could-not-convert-currencies.exception";

@Injectable()
export class XratesCurrencyConversionService implements CurrencyConversionService{

    async convert(origin: Currency, destination: Currency, amount: number): Promise<number> {
        let conversion: number;

        try{
            conversion = await ExchangeRates.convert(amount, origin, destination);
        }catch (e){
            throw new CouldNotConvertCurrenciesException();
        }

        return Math.round(conversion);
    }
}