interface Currency {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
}

export function getCurrencyRates(currencies: Currency[]) {
  return new Map(currencies.map((currency) => [currency.cc, currency.rate]));
}
