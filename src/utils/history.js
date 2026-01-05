// History/Audit log management
export function addHistoryEntry(type, itemId, itemName, details = {}) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type, // 'added', 'edited', 'removed', 'deleted', 'restored'
    itemId,
    itemName,
    details,
  };
  history.unshift(entry);
  // Keep only last 1000 entries
  if (history.length > 1000) {
    history.splice(1000);
  }
  localStorage.setItem("verishelf-history", JSON.stringify(history));
  return entry;
}

export function getHistory() {
  const saved = localStorage.getItem("verishelf-history");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function clearHistory() {
  localStorage.removeItem("verishelf-history");
}

