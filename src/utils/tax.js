// Tax/VAT calculations
export function calculateTax(price, taxRate = 0) {
  return price * (taxRate / 100);
}

export function calculatePriceWithTax(price, taxRate = 0) {
  return price + calculateTax(price, taxRate);
}

export function getTaxSettings() {
  const saved = localStorage.getItem("verishelf-tax-settings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { defaultTaxRate: 0, taxInclusive: false };
    }
  }
  return { defaultTaxRate: 0, taxInclusive: false };
}

export function saveTaxSettings(settings) {
  localStorage.setItem("verishelf-tax-settings", JSON.stringify(settings));
}

