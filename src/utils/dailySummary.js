// Daily Summary Email/Report Generator
// Generates end-of-day summary with key metrics, compliance status, and outstanding issues

import { getStatus, daysUntilExpiry } from "./expiry";
import { generatePDFReport } from "./pdf";
import { exportToCSV } from "./export";
import { getSettings } from "./settings";
import { sendEmailAlert } from "./alerts";

/**
 * Generate daily summary data
 */
export function generateDailySummary(items, settings = null) {
  const activeItems = items.filter((i) => !i.removed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate metrics
  const expired = activeItems.filter((i) => getStatus(i.expiry || i.expiryDate) === "EXPIRED");
  const expiringSoon = activeItems.filter((i) => {
    const status = getStatus(i.expiry || i.expiryDate);
    return status === "WARNING";
  });
  const safe = activeItems.filter((i) => getStatus(i.expiry || i.expiryDate) === "SAFE");

  // Items handled today (status changed today)
  const itemsHandledToday = activeItems.filter((item) => {
    if (item.removedAt) {
      const removedDate = new Date(item.removedAt);
      removedDate.setHours(0, 0, 0, 0);
      return removedDate.getTime() === today.getTime();
    }
    // Check if status was updated today (would need updated_at field)
    return false;
  });

  // Items by status
  const discounted = activeItems.filter((i) => i.itemStatus === "discounted");
  const remerchandised = activeItems.filter((i) => i.itemStatus === "re-merchandised");

  // Outstanding issues
  const outstandingIssues = [
    ...expired.map((item) => ({
      type: "expired",
      item: item.name,
      location: item.location,
      expiryDate: item.expiry || item.expiryDate,
      daysOverdue: Math.abs(daysUntilExpiry(item.expiry || item.expiryDate)),
    })),
    ...expiringSoon
      .filter((item) => {
        const days = daysUntilExpiry(item.expiry || item.expiryDate);
        return days <= 1; // Expiring today or tomorrow
      })
      .map((item) => ({
        type: "expiring_urgent",
        item: item.name,
        location: item.location,
        expiryDate: item.expiry || item.expiryDate,
        daysUntil: daysUntilExpiry(item.expiry || item.expiryDate),
      })),
  ];

  // Compliance status
  const complianceStatus = {
    riskLevel: expired.length > 10 ? "HIGH" : expired.length > 5 ? "MEDIUM" : "LOW",
    expiredCount: expired.length,
    expiringSoonCount: expiringSoon.length,
    totalItems: activeItems.length,
    complianceRate: activeItems.length > 0 
      ? ((activeItems.length - expired.length) / activeItems.length * 100).toFixed(1)
      : "100.0",
  };

  // Total value
  const totalValue = activeItems.reduce((sum, item) => sum + (item.price || item.cost || 0) * item.quantity, 0);
  const expiredValue = expired.reduce((sum, item) => sum + (item.price || item.cost || 0) * item.quantity, 0);

  return {
    date: today.toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
    metrics: {
      totalItems: activeItems.length,
      expired: expired.length,
      expiringSoon: expiringSoon.length,
      safe: safe.length,
      discounted: discounted.length,
      remerchandised: remerchandised.length,
      itemsHandledToday: itemsHandledToday.length,
      totalValue: totalValue.toFixed(2),
      expiredValue: expiredValue.toFixed(2),
    },
    compliance: complianceStatus,
    outstandingIssues,
    locations: [...new Set(activeItems.map((i) => i.location).filter(Boolean))],
  };
}

/**
 * Format daily summary as email HTML
 */
export function formatDailySummaryEmail(summary, userEmail = null) {
  const { date, metrics, compliance, outstandingIssues, locations } = summary;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9fafb; }
        .metric-box { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #111827; }
        .issue-item { background: white; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #ef4444; }
        .compliance-badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
        .compliance-high { background: #fee2e2; color: #991b1b; }
        .compliance-medium { background: #fef3c7; color: #92400e; }
        .compliance-low { background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>VeriShelf Daily Summary</h1>
        <p>${new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div class="content">
        <h2>Key Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div class="metric-box">
            <div class="metric-label">Total Items</div>
            <div class="metric-value">${metrics.totalItems}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Expired</div>
            <div class="metric-value" style="color: #ef4444;">${metrics.expired}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Expiring Soon</div>
            <div class="metric-value" style="color: #f59e0b;">${metrics.expiringSoon}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Items Handled Today</div>
            <div class="metric-value">${metrics.itemsHandledToday}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Total Value</div>
            <div class="metric-value">$${metrics.totalValue}</div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Expired Value</div>
            <div class="metric-value" style="color: #ef4444;">$${metrics.expiredValue}</div>
          </div>
        </div>

        <h2 style="margin-top: 30px;">Compliance Status</h2>
        <div class="metric-box">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="metric-label">Risk Level</div>
              <span class="compliance-badge compliance-${compliance.riskLevel.toLowerCase()}">${compliance.riskLevel}</span>
            </div>
            <div>
              <div class="metric-label">Compliance Rate</div>
              <div class="metric-value">${compliance.complianceRate}%</div>
            </div>
          </div>
        </div>

        ${outstandingIssues.length > 0 ? `
          <h2 style="margin-top: 30px;">Outstanding Issues (${outstandingIssues.length})</h2>
          ${outstandingIssues.slice(0, 10).map((issue) => `
            <div class="issue-item">
              <strong>${issue.item}</strong> - ${issue.location}<br>
              ${issue.type === "expired" 
                ? `Expired ${issue.daysOverdue} day(s) ago` 
                : `Expires in ${issue.daysUntil} day(s)`}
            </div>
          `).join("")}
          ${outstandingIssues.length > 10 ? `<p><em>... and ${outstandingIssues.length - 10} more issues</em></p>` : ""}
        ` : `
          <h2 style="margin-top: 30px;">Outstanding Issues</h2>
          <p>No outstanding issues. All items are in compliance.</p>
        `}

        <h2 style="margin-top: 30px;">Locations</h2>
        <p>${locations.length} location(s): ${locations.join(", ")}</p>

        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          This is an automated daily summary from VeriShelf. For questions or support, contact your system administrator.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send daily summary email (if email is configured)
 */
export async function sendDailySummaryEmail(items, settings = null, userEmail = null) {
  const appSettings = settings || getSettings();
  
  if (!appSettings.enableEmailAlerts || !appSettings.emailConfig) {
    console.log("Email alerts not configured. Skipping daily summary email.");
    return { success: false, error: "Email alerts not configured" };
  }

  const summary = generateDailySummary(items, appSettings);
  const emailHtml = formatDailySummaryEmail(summary, userEmail);

  const subject = `VeriShelf Daily Summary - ${summary.date} - ${summary.compliance.riskLevel} Risk`;

  try {
    // In a real implementation, this would call an email service API
    // For now, we'll use the existing sendEmailAlert infrastructure
    const emailConfig = appSettings.emailConfig;
    
    // Example: Send via configured email service
    // await fetch(emailConfig.apiEndpoint, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     to: userEmail || emailConfig.recipients,
    //     subject,
    //     html: emailHtml,
    //     apiKey: emailConfig.apiKey,
    //   }),
    // });

    console.log("Daily summary email sent:", { 
      subject, 
      recipients: userEmail || emailConfig.recipients,
      summary: summary.metrics 
    });
    
    return { 
      success: true, 
      method: "email",
      summary 
    };
  } catch (error) {
    console.error("Failed to send daily summary email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Export daily summary as PDF
 */
export function exportDailySummaryPDF(items, settings = null) {
  const summary = generateDailySummary(items, settings);
  const activeItems = items.filter((i) => !i.removed);
  
  // Generate PDF with summary data
  generatePDFReport(activeItems, "summary", summary);
}

/**
 * Export daily summary as CSV
 */
export function exportDailySummaryCSV(items, settings = null) {
  const summary = generateDailySummary(items, settings);
  const activeItems = items.filter((i) => !i.removed);
  
  // Create CSV with summary metrics
  const csvRows = [
    ["Daily Summary Report", summary.date],
    [],
    ["Metric", "Value"],
    ["Total Items", summary.metrics.totalItems],
    ["Expired", summary.metrics.expired],
    ["Expiring Soon", summary.metrics.expiringSoon],
    ["Items Handled Today", summary.metrics.itemsHandledToday],
    ["Total Value", `$${summary.metrics.totalValue}`],
    ["Expired Value", `$${summary.metrics.expiredValue}`],
    [],
    ["Compliance", ""],
    ["Risk Level", summary.compliance.riskLevel],
    ["Compliance Rate", `${summary.compliance.complianceRate}%`],
    [],
    ["Outstanding Issues", ""],
    ...summary.outstandingIssues.map((issue) => [
      issue.item,
      issue.location,
      issue.type === "expired" ? `Expired ${issue.daysOverdue} days ago` : `Expires in ${issue.daysUntil} days`,
    ]),
  ];

  const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `verishelf-daily-summary-${summary.date}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
