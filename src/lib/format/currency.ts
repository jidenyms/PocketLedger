/** ISO 4217 codes we support in settings (display only; amounts stored as decimals). */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "NGN",
  "INR",
  "JPY",
  "CHF",
  "SEK",
  "NZD",
  "MXN",
  "BRL",
  "ZAR",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  USD: "US Dollar (USD)",
  EUR: "Euro (EUR)",
  GBP: "British Pound (GBP)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
  NGN: "Nigerian Naira (NGN)",
  INR: "Indian Rupee (INR)",
  JPY: "Japanese Yen (JPY)",
  CHF: "Swiss Franc (CHF)",
  SEK: "Swedish Krona (SEK)",
  NZD: "New Zealand Dollar (NZD)",
  MXN: "Mexican Peso (MXN)",
  BRL: "Brazilian Real (BRL)",
  ZAR: "South African Rand (ZAR)",
};

/** Display helper — API amounts are decimal strings. */
export function formatMoney(
  amount: string | number,
  currency: string = "USD",
): string {
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "—";

  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency.length === 3 ? currency : "USD",
  };

  if (opts.currency === "JPY" || opts.currency === "KRW") {
    opts.minimumFractionDigits = 0;
    opts.maximumFractionDigits = 0;
  } else {
    opts.minimumFractionDigits = 2;
    opts.maximumFractionDigits = 2;
  }

  try {
    return new Intl.NumberFormat("en-US", opts).format(n);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }
}
