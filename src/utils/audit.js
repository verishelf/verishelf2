// Audit & Compliance - Full removal logs, timestamps, photos, user attribution

/**
 * Get current user (from localStorage or default)
 */
export function getCurrentUser() {
  const user = localStorage.getItem("verishelf-current-user");
  if (user) {
    return JSON.parse(user);
  }
  return {
    id: "system",
    name: "System",
    email: null,
    role: "user",
  };
}

/**
 * Set current user
 */
export function setCurrentUser(user) {
  localStorage.setItem("verishelf-current-user", JSON.stringify(user));
}

/**
 * Create audit log entry
 */
export function createAuditLog(action, itemId, itemName, details = {}) {
  const user = getCurrentUser();
  const log = {
    id: Date.now() + Math.random(),
    action, // 'added', 'removed', 'edited', 'deleted', 'restored', 'approved', 'rejected'
    itemId,
    itemName,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    timestamp: new Date().toISOString(),
    location: details.location || null,
    photo: details.photo || null,
    notes: details.notes || null,
    metadata: details.metadata || {},
  };

  // Save to localStorage
  const logs = getAuditLogs();
  logs.push(log);
  localStorage.setItem("verishelf-audit-logs", JSON.stringify(logs));

  return log;
}

/**
 * Get all audit logs
 */
export function getAuditLogs(filters = {}) {
  const saved = localStorage.getItem("verishelf-audit-logs");
  let logs = saved ? JSON.parse(saved) : [];

  // Apply filters
  if (filters.itemId) {
    logs = logs.filter((log) => log.itemId === filters.itemId);
  }
  if (filters.action) {
    logs = logs.filter((log) => log.action === filters.action);
  }
  if (filters.userId) {
    logs = logs.filter((log) => log.userId === filters.userId);
  }
  if (filters.location) {
    logs = logs.filter((log) => log.location === filters.location);
  }
  if (filters.startDate) {
    logs = logs.filter((log) => new Date(log.timestamp) >= new Date(filters.startDate));
  }
  if (filters.endDate) {
    logs = logs.filter((log) => new Date(log.timestamp) <= new Date(filters.endDate));
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get audit log for specific item
 */
export function getItemAuditLog(itemId) {
  return getAuditLogs({ itemId });
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCSV(logs, filename = "verishelf-audit-logs.csv") {
  if (logs.length === 0) {
    alert("No audit logs to export");
    return;
  }

  const headers = [
    "Timestamp",
    "Action",
    "Item Name",
    "Item ID",
    "User Name",
    "User Email",
    "Location",
    "Notes",
  ];

  const rows = logs.map((log) => [
    log.timestamp,
    log.action,
    log.itemName || "",
    log.itemId || "",
    log.userName || "",
    log.userEmail || "",
    log.location || "",
    log.notes || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export audit logs to PDF (requires jspdf)
 */
export async function exportAuditLogsToPDF(logs, filename = "verishelf-audit-logs.pdf") {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("VeriShelf Audit Log Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Entries: ${logs.length}`, 14, 36);

    let y = 50;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;

    logs.forEach((log, index) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(`${index + 1}. ${log.action.toUpperCase()} - ${log.itemName}`, 14, y);
      y += lineHeight;

      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      doc.text(`   Timestamp: ${new Date(log.timestamp).toLocaleString()}`, 14, y);
      y += lineHeight;
      doc.text(`   User: ${log.userName}${log.userEmail ? ` (${log.userEmail})` : ""}`, 14, y);
      y += lineHeight;
      if (log.location) {
        doc.text(`   Location: ${log.location}`, 14, y);
        y += lineHeight;
      }
      if (log.notes) {
        doc.text(`   Notes: ${log.notes}`, 14, y);
        y += lineHeight;
      }
      y += 3;
    });

    doc.save(filename);
    return { success: true };
  } catch (error) {
    console.error("Failed to export audit logs to PDF:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get compliance report
 */
export function getComplianceReport(startDate, endDate) {
  const logs = getAuditLogs({
    startDate,
    endDate,
  });

  const report = {
    period: {
      start: startDate,
      end: endDate,
    },
    totalActions: logs.length,
    actionsByType: {},
    actionsByUser: {},
    actionsByLocation: {},
    removalActions: [],
    photosAttached: 0,
  };

  logs.forEach((log) => {
    // Count by action type
    report.actionsByType[log.action] = (report.actionsByType[log.action] || 0) + 1;

    // Count by user
    if (!report.actionsByUser[log.userName]) {
      report.actionsByUser[log.userName] = 0;
    }
    report.actionsByUser[log.userName]++;

    // Count by location
    if (log.location) {
      if (!report.actionsByLocation[log.location]) {
        report.actionsByLocation[log.location] = 0;
      }
      report.actionsByLocation[log.location]++;
    }

    // Track removals
    if (log.action === "removed") {
      report.removalActions.push(log);
    }

    // Count photos
    if (log.photo) {
      report.photosAttached++;
    }
  });

  return report;
}

