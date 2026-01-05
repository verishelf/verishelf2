// Product approval workflow
export function getApprovalSettings() {
  const saved = localStorage.getItem("verishelf-approval-settings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { enabled: false, requireApproval: false };
    }
  }
  return { enabled: false, requireApproval: false };
}

export function saveApprovalSettings(settings) {
  localStorage.setItem("verishelf-approval-settings", JSON.stringify(settings));
}

export function approveItem(itemId, approver = "System") {
  const items = JSON.parse(localStorage.getItem("verishelf-items") || "[]");
  const updated = items.map((item) =>
    item.id === itemId
      ? { ...item, approved: true, approvedAt: new Date().toISOString(), approver }
      : item
  );
  localStorage.setItem("verishelf-items", JSON.stringify(updated));
  return updated;
}

