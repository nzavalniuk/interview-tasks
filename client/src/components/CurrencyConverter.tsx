import React, { useState } from "react";

type CurrencyCode = "USD" | "EUR" | "UAH";

interface Currency {
  code: CurrencyCode;
  name: string;
}

export const API_BASE_URL = "http://localhost:8000";

const defaultCurrencies: Currency[] = [
  { code: "USD", name: "Долар США" },
  { code: "EUR", name: "Євро" },
  { code: "UAH", name: "Гривня" },
];

const CurrencyConverter: React.FC = () => {
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("UAH");
  const [amount, setAmount] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleConvert() {
    if (!amount || isNaN(+amount) || amount <= 0) {
      setError("Некоректна сума");
      return;
    }

    if (from === to) {
      setResult(`${amount.toFixed(2)} ${from} = ${amount} ${to}`);
      return;
    }

    setIsLoading(true);
    fetch(
      `${API_BASE_URL}/convert-currency?from=${from}&to=${to}&amount=${amount}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Не вдалося отримати дані");
        }
        return res.json();
      })
      .then((data) => {
        setResult(`${amount.toFixed(2)} ${from} = ${data.amount} ${to}`);
      })
      .catch(() => {
        setResult("");
        setError("Не вдалося отримати дані");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 2px 8px #ddd",
      }}
    >
      <h2>Конвертер валют (НБУ)</h2>
      <div>
        <input
          type="number"
          value={amount}
          min={0}
          step="any"
          onChange={(e) => {
            setAmount(Number(e.target.value));
            setError(null);
          }}
          style={{ width: "100%", marginBottom: 12, fontSize: 18, padding: 8 }}
        />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value as CurrencyCode)}
          style={{ flex: 1 }}
        >
          {defaultCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <span style={{ alignSelf: "center" }}>→</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value as CurrencyCode)}
          style={{ flex: 1 }}
        >
          {defaultCurrencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          style={{ width: "100%" }}
          onClick={handleConvert}
          disabled={isLoading}
        >
          {isLoading ? "Конвертування..." : "Конвертувати"}
        </button>
        <div style={{ margin: "1rem 0", height: 24 }}>
          {!isLoading && result && (
            <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{result}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
