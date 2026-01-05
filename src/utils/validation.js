// Data validation rules
export const validationRules = {
  barcode: {
    pattern: /^[0-9]{8,14}$/,
    message: "Barcode must be 8-14 digits",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: "Invalid phone number format",
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: "URL must start with http:// or https://",
  },
};

export function validateField(value, ruleName, customRule = null) {
  const rule = customRule || validationRules[ruleName];
  if (!rule) return { valid: true };

  if (rule.pattern && !rule.pattern.test(value)) {
    return { valid: false, message: rule.message };
  }

  if (rule.minLength && value.length < rule.minLength) {
    return { valid: false, message: `Minimum length is ${rule.minLength}` };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return { valid: false, message: `Maximum length is ${rule.maxLength}` };
  }

  return { valid: true };
}

export function validateItem(item, customRules = {}) {
  const errors = {};

  // Required fields
  if (!item.name || item.name.trim() === "") {
    errors.name = "Product name is required";
  }

  if (!item.expiry) {
    errors.expiry = "Expiry date is required";
  }

  // Barcode validation
  if (item.barcode && customRules.barcode) {
    const barcodeValidation = validateField(item.barcode, "barcode", customRules.barcode);
    if (!barcodeValidation.valid) {
      errors.barcode = barcodeValidation.message;
    }
  }

  // Price validation
  if (item.price !== undefined && item.price < 0) {
    errors.price = "Price cannot be negative";
  }

  // Quantity validation
  if (item.quantity !== undefined && item.quantity < 0) {
    errors.quantity = "Quantity cannot be negative";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

