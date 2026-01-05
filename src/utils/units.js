// Unit of measure management
export const UNIT_TYPES = {
  weight: ["kg", "g", "lb", "oz"],
  volume: ["L", "mL", "gal", "fl oz"],
  count: ["piece", "box", "pack", "case", "unit"],
  length: ["m", "cm", "ft", "in"],
};

export function getUnits() {
  const saved = localStorage.getItem("verishelf-units");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return UNIT_TYPES;
    }
  }
  return UNIT_TYPES;
}

export function convertUnit(value, fromUnit, toUnit, unitType) {
  const conversions = {
    weight: {
      kg: { g: 1000, lb: 2.20462, oz: 35.274 },
      g: { kg: 0.001, lb: 0.00220462, oz: 0.035274 },
      lb: { kg: 0.453592, g: 453.592, oz: 16 },
      oz: { kg: 0.0283495, g: 28.3495, lb: 0.0625 },
    },
    volume: {
      L: { mL: 1000, gal: 0.264172, "fl oz": 33.814 },
      mL: { L: 0.001, gal: 0.000264172, "fl oz": 0.033814 },
      gal: { L: 3.78541, mL: 3785.41, "fl oz": 128 },
      "fl oz": { L: 0.0295735, mL: 29.5735, gal: 0.0078125 },
    },
    length: {
      m: { cm: 100, ft: 3.28084, in: 39.3701 },
      cm: { m: 0.01, ft: 0.0328084, in: 0.393701 },
      ft: { m: 0.3048, cm: 30.48, in: 12 },
      in: { m: 0.0254, cm: 2.54, ft: 0.0833333 },
    },
  };

  if (fromUnit === toUnit) return value;

  const typeConversions = conversions[unitType];
  if (!typeConversions || !typeConversions[fromUnit] || !typeConversions[fromUnit][toUnit]) {
    return value; // No conversion available
  }

  return value * typeConversions[fromUnit][toUnit];
}

