// Multi-currency support
const DEFAULT_CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", rate: 1 },
  EUR: { symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.79 },
  JPY: { symbol: "¥", name: "Japanese Yen", rate: 150 },
  CAD: { symbol: "C$", name: "Canadian Dollar", rate: 1.35 },
  AUD: { symbol: "A$", name: "Australian Dollar", rate: 1.52 },
};

export function getCurrencies() {
  const saved = localStorage.getItem("verishelf-currencies");
  if (saved) {
    try {
      return { ...DEFAULT_CURRENCIES, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_CURRENCIES;
    }
  }
  return DEFAULT_CURRENCIES;
}

export function getDefaultCurrency() {
  const settings = JSON.parse(localStorage.getItem("verishelf-settings") || "{}");
  return settings.currency || "USD";
}

export function formatCurrency(amount, currency = "USD") {
  const currencies = getCurrencies();
  const curr = currencies[currency] || currencies.USD;
  return `${curr.symbol}${(amount * curr.rate).toFixed(2)}`;
}

export function convertCurrency(amount, fromCurrency, toCurrency) {
  const currencies = getCurrencies();
  const from = currencies[fromCurrency] || currencies.USD;
  const to = currencies[toCurrency] || currencies.USD;
  return (amount * from.rate) / to.rate;
}

