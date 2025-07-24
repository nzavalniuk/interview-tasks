import { Currency } from "../types";

export function getCurrencyRateToUAH(
  currencies: Currency[],
  currencyName: string
) {
  return currencies.find((currency) => currency.cc === currencyName)?.rate;
}
