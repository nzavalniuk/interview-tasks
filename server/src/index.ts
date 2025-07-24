import express from "express";
import cors from "cors";
import axios from "axios";
import { Currency } from "./types";
import { getCurrencyRateToUAH } from "./utils/getCurrencyRateToUAH";
import dotenv from "dotenv";
dotenv.config();

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

      if (!from || !to || !amount) {
        res.status(400).json({ error: "Bad request" });
        return;
      }

      const amountNumber = Number(amount);

      if (isNaN(amountNumber)) {
        res.status(400).json({
          error:
            "Invalid value of 'amount' parameter, it must be a string number",
        });
        return;
      }

      const currencies = (await axios.get(process.env.BANK_API_URL!))
        .data as Currency[];

      const rateFromExchangeCurrencyToUAH = getCurrencyRateToUAH(
        currencies,
        from
      );

      if (!rateFromExchangeCurrencyToUAH && from !== "UAH") {
        res.status(400).json({ error: "Invalid value of 'from' parameter" });
        return;
      }

      const rateFromUAHToExchangeCurrency = getCurrencyRateToUAH(
        currencies,
        to
      );

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
