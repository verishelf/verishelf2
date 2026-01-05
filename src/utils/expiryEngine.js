// Automated Expiry Engine - Continuous checks every 15 minutes, timezone aware
import { getSettings } from "./settings";
import { getTimezones } from "./timezone";
import { checkExpiredItems } from "./notifications";
import { sendEmailAlert, sendSMSAlert } from "./alerts";

let expiryCheckInterval = null;
let lastCheckTime = null;

/**
 * Convert date to specific timezone
 */
export function convertToTimezone(date, timezone) {
  const dateStr = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(dateStr);
}

/**
 * Get current time in specified timezone
 */
export function getCurrentTimeInTimezone(timezone) {
  return convertToTimezone(new Date(), timezone);
}

/**
 * Check all items across all locations with timezone awareness
 */
export function performExpiryCheck(items, settings) {
  const timezone = settings.timezone || "UTC";
  const now = getCurrentTimeInTimezone(timezone);
  const warningDays = settings.warningDays || 3;
  
  const results = {
    expired: [],
    expiringSoon: [],
    locations: {},
    timestamp: now.toISOString(),
    timezone,
  };

  items
    .filter((item) => !item.removed)
    .forEach((item) => {
      // Convert item expiry to timezone-aware date
      const expiryDate = new Date(item.expiry);
      const expiryInTimezone = convertToTimezone(expiryDate, timezone);
      
      const daysUntil = Math.ceil((expiryInTimezone - now) / (1000 * 60 * 60 * 24));
      
      const itemResult = {
        ...item,
        daysUntil,
        expiryDate: expiryInTimezone.toISOString(),
        location: item.location || settings.defaultLocation,
      };

      if (daysUntil < 0) {
        results.expired.push(itemResult);
      } else if (daysUntil <= warningDays) {
        results.expiringSoon.push(itemResult);
      }

      // Track by location
      const location = item.location || settings.defaultLocation;
      if (!results.locations[location]) {
        results.locations[location] = {
          expired: [],
          expiringSoon: [],
        };
      }
      
      if (daysUntil < 0) {
        results.locations[location].expired.push(itemResult);
      } else if (daysUntil <= warningDays) {
        results.locations[location].expiringSoon.push(itemResult);
      }
    });

  return results;
}

/**
 * Start automated expiry checking every 15 minutes
 */
export function startExpiryEngine(items, settings, onResults) {
  // Clear any existing interval
  if (expiryCheckInterval) {
    clearInterval(expiryCheckInterval);
  }

  // Perform initial check
  const initialResults = performExpiryCheck(items, settings);
  lastCheckTime = new Date();
  if (onResults) onResults(initialResults);

  // Set up 15-minute interval (900000 ms)
  expiryCheckInterval = setInterval(() => {
    const results = performExpiryCheck(items, settings);
    lastCheckTime = new Date();
    
    // Trigger alerts
    if (results.expired.length > 0) {
      checkExpiredItems(items);
      
      // Send email/SMS if configured
      if (settings.enableEmailAlerts && settings.emailConfig) {
        sendEmailAlert(results.expired, settings);
      }
      
      if (settings.enableSMSAlerts && settings.smsConfig) {
        sendSMSAlert(results.expired, settings);
      }
    }

    if (onResults) onResults(results);
  }, 15 * 60 * 1000); // 15 minutes

  return expiryCheckInterval;
}

/**
 * Stop the expiry engine
 */
export function stopExpiryEngine() {
  if (expiryCheckInterval) {
    clearInterval(expiryCheckInterval);
    expiryCheckInterval = null;
  }
}

/**
 * Get last check time
 */
export function getLastCheckTime() {
  return lastCheckTime;
}

/**
 * Get next check time
 */
export function getNextCheckTime() {
  if (!lastCheckTime) return null;
  return new Date(lastCheckTime.getTime() + 15 * 60 * 1000);
}

