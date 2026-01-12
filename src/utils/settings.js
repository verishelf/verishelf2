// Settings management
const DEFAULT_SETTINGS = {
  warningDays: 3,
  defaultLocation: "",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  enableNotifications: true,
  enableKeyboardShortcuts: true,
  categories: ["Dairy", "Produce", "Meat", "Bakery", "Beverages", "Frozen", "Pantry", "Other"],
};

export function getSettings() {
  const saved = localStorage.getItem("verishelf-settings");
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  localStorage.setItem("verishelf-settings", JSON.stringify(settings));
}

export function getSetting(key) {
  const settings = getSettings();
  return settings[key] ?? DEFAULT_SETTINGS[key];
}

