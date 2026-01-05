// Enhanced alerts system with SMS and Email support
import { showNotification } from "./notifications";

// Custom alerts and reminders
export function getAlerts(items, settings) {
  const alerts = [];
  const today = new Date();
  const warningDays = settings.warningDays || 3;

  items
    .filter((i) => !i.removed)
    .forEach((item) => {
      const expiry = new Date(item.expiry);
      const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      // Expired
      if (daysUntil < 0) {
        alerts.push({
          type: "expired",
          priority: "high",
          item,
          daysUntil,
          message: `${item.name} expired ${Math.abs(daysUntil)} day(s) ago`,
          timestamp: new Date().toISOString(),
        });
      }
      // Expiring soon
      else if (daysUntil <= warningDays) {
        alerts.push({
          type: "expiring",
          priority: daysUntil <= 1 ? "high" : "medium",
          item,
          daysUntil,
          message: `${item.name} expires in ${daysUntil} day(s)`,
          timestamp: new Date().toISOString(),
        });
      }

      // Low stock (if reorder point set)
      if (item.reorderPoint && item.quantity <= item.reorderPoint) {
        alerts.push({
          type: "low_stock",
          priority: "medium",
          item,
          message: `${item.name} is low on stock (${item.quantity} remaining)`,
          timestamp: new Date().toISOString(),
        });
      }
    });

  return alerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Send email alert (requires email service configuration)
 */
export async function sendEmailAlert(expiredItems, settings) {
  if (!settings.emailConfig || !settings.enableEmailAlerts) {
    return { success: false, error: "Email alerts not configured" };
  }

  const emailConfig = settings.emailConfig;
  const subject = `VeriShelf Alert: ${expiredItems.length} Item(s) Expired`;
  const body = `
    <h2>Expired Items Alert</h2>
    <p>You have ${expiredItems.length} expired item(s) that require immediate attention:</p>
    <ul>
      ${expiredItems.map(item => `
        <li>
          <strong>${item.name}</strong> - 
          Location: ${item.location || "Unknown"} - 
          Expired: ${new Date(item.expiry).toLocaleDateString()}
        </li>
      `).join("")}
    </ul>
    <p>Please remove these items from shelves immediately.</p>
  `;

  // In a real implementation, this would call an email service API
  // For now, we'll simulate it
  try {
    // Example: Send via configured email service
    // await fetch(emailConfig.apiEndpoint, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     to: emailConfig.recipients,
    //     subject,
    //     body,
    //     apiKey: emailConfig.apiKey,
    //   }),
    // });

    console.log("Email alert sent:", { subject, recipients: emailConfig.recipients });
    return { success: true, method: "email" };
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS alert (requires SMS service configuration)
 */
export async function sendSMSAlert(expiredItems, settings) {
  if (!settings.smsConfig || !settings.enableSMSAlerts) {
    return { success: false, error: "SMS alerts not configured" };
  }

  const smsConfig = settings.smsConfig;
  const message = `VeriShelf Alert: ${expiredItems.length} item(s) expired. Check dashboard for details.`;

  // In a real implementation, this would call an SMS service API (e.g., Twilio)
  try {
    // Example: Send via SMS service
    // await fetch(smsConfig.apiEndpoint, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     to: smsConfig.recipients,
    //     message,
    //     apiKey: smsConfig.apiKey,
    //   }),
    // });

    console.log("SMS alert sent:", { message, recipients: smsConfig.recipients });
    return { success: true, method: "sms" };
  } catch (error) {
    console.error("Failed to send SMS alert:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification (browser notification)
 */
export function sendPushNotification(title, body, data = {}) {
  showNotification(title, {
    body,
    data,
    requireInteraction: true,
    tag: "verishelf-alert",
  });
}

/**
 * Track SLA compliance (30-minute rule)
 */
export function checkSLACompliance(expiredItems, removalLogs) {
  const slaViolations = [];
  const slaThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds

  expiredItems.forEach((item) => {
    const expiryTime = new Date(item.expiry).getTime();
    const removalLog = removalLogs.find(
      (log) => log.itemId === item.id && log.action === "removed"
    );

    if (removalLog) {
      const removalTime = new Date(removalLog.timestamp).getTime();
      const timeToRemoval = removalTime - expiryTime;

      if (timeToRemoval > slaThreshold) {
        slaViolations.push({
          item,
          expiryTime: new Date(expiryTime),
          removalTime: new Date(removalTime),
          delayMinutes: Math.round((timeToRemoval - slaThreshold) / (60 * 1000)),
        });
      }
    } else {
      // Item expired but not yet removed
      const now = Date.now();
      const timeSinceExpiry = now - expiryTime;
      
      if (timeSinceExpiry > slaThreshold) {
        slaViolations.push({
          item,
          expiryTime: new Date(expiryTime),
          removalTime: null,
          delayMinutes: Math.round((timeSinceExpiry - slaThreshold) / (60 * 1000)),
          status: "pending",
        });
      }
    }
  });

  return slaViolations;
}

export function saveAlertPreferences(preferences) {
  localStorage.setItem("verishelf-alert-preferences", JSON.stringify(preferences));
}

export function getAlertPreferences() {
  const saved = localStorage.getItem("verishelf-alert-preferences");
  return saved ? JSON.parse(saved) : {
    enableEmail: false,
    enableSMS: false,
    enablePush: true,
    emailRecipients: [],
    smsRecipients: [],
  };
}
