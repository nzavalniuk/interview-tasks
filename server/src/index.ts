import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { getCurrencyRates } from "./utils/getCurrenciesRate";
import dayjs from "dayjs";
import { isQueryValid } from "./utils/isQueryValid";
dotenv.config();

let cachedCurrencyRates: Map<string, number> | null = null;
let lastUpdate = dayjs().startOf("day");

const createHTTPServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: true }));

  app.use("/ping", (req, res) => {
    res.send("Pong!");
  });

  app.use("/convert-currency", async (req, res) => {
    try {
      const { from, to, amount } = req.query as Record<string, string>;

      if (!isQueryValid(from, to, amount)) {
        res.status(400).json({ error: "Invalid query parameters" });
        return;
      }

      const amountNumber = Number(amount);

      if (from === to) {
        res.json({ amount: amountNumber });
        return;
      }

      // check if last update was more than 24 hours ago
      const isUpdateNeeded = dayjs().startOf("day").isAfter(lastUpdate, "day");

      // update cache every day at 00:00:00
      if (!cachedCurrencyRates || isUpdateNeeded) {
        const currencies = (await axios.get(process.env.BANK_API_URL!)).data;

        cachedCurrencyRates = getCurrencyRates(currencies);
        lastUpdate = dayjs().startOf("day");
      }

      const rateFromExchangeCurrencyToUAH = cachedCurrencyRates.get(from);

      if (!rateFromExchangeCurrencyToUAH && from !== "UAH") {
        res.status(400).json({ error: "Invalid value of 'from' parameter" });
        return;
      }

      const rateFromUAHToExchangeCurrency = cachedCurrencyRates.get(to);

      if (!rateFromUAHToExchangeCurrency && to !== "UAH") {
        res.status(400).json({ error: "Invalid value of 'to' parameter" });
        return;
      }

      if (from === "UAH") {
        const convertedAmount = Number(
          (amountNumber / rateFromUAHToExchangeCurrency!).toFixed(2)
        );

        res.json({ amount: convertedAmount });
        return;
      }

      if (to === "UAH") {
        const convertedAmount = Number(
          (amountNumber * rateFromExchangeCurrencyToUAH!).toFixed(2)
        );

        res.json({ amount: convertedAmount });
        return;
      }

      const currencyRatio =
        rateFromExchangeCurrencyToUAH! / rateFromUAHToExchangeCurrency!;

      const convertedAmount = Number((amountNumber * currencyRatio).toFixed(2));

      res.json({ amount: convertedAmount });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  });

  return app;
};

export const app = createHTTPServer();
