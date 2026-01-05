// Offline sync support for mobile barcode scanning
const OFFLINE_STORAGE_KEY = "verishelf-offline-queue";
const SYNC_STATUS_KEY = "verishelf-sync-status";

/**
 * Check if device is online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Save item to offline queue
 */
export function addToOfflineQueue(action, data) {
  const queue = getOfflineQueue();
  queue.push({
    id: Date.now() + Math.random(),
    action, // 'add', 'update', 'remove', 'delete'
    data,
    timestamp: new Date().toISOString(),
    synced: false,
  });
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
  return queue.length;
}

/**
 * Get offline queue
 */
export function getOfflineQueue() {
  const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

/**
 * Clear synced items from queue
 */
export function clearSyncedItems() {
  const queue = getOfflineQueue();
  const unsynced = queue.filter((item) => !item.synced);
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(unsynced));
  return unsynced.length;
}

/**
 * Mark item as synced
 */
export function markAsSynced(queueItemId) {
  const queue = getOfflineQueue();
  const item = queue.find((i) => i.id === queueItemId);
  if (item) {
    item.synced = true;
    item.syncedAt = new Date().toISOString();
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
  }
}

/**
 * Sync offline queue when connection is restored
 */
export async function syncOfflineQueue(onSyncItem) {
  if (!isOnline()) {
    return { success: false, error: "Device is offline" };
  }

  const queue = getOfflineQueue();
  const unsynced = queue.filter((item) => !item.synced);
  
  if (unsynced.length === 0) {
    return { success: true, synced: 0, message: "No items to sync" };
  }

  let syncedCount = 0;
  const errors = [];

  for (const item of unsynced) {
    try {
      // Call the sync callback for each item
      if (onSyncItem) {
        await onSyncItem(item);
        markAsSynced(item.id);
        syncedCount++;
      }
    } catch (error) {
      errors.push({ item, error: error.message });
    }
  }

  // Clear synced items
  clearSyncedItems();

  return {
    success: errors.length === 0,
    synced: syncedCount,
    errors,
  };
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  const queue = getOfflineQueue();
  const unsynced = queue.filter((item) => !item.synced);
  
  return {
    isOnline: isOnline(),
    pendingItems: unsynced.length,
    lastSync: localStorage.getItem("verishelf-last-sync") || null,
  };
}

/**
 * Set last sync time
 */
export function setLastSyncTime() {
  localStorage.setItem("verishelf-last-sync", new Date().toISOString());
}

/**
 * Listen for online/offline events
 */
export function setupOfflineListener(onOnline, onOffline) {
  window.addEventListener("online", () => {
    setLastSyncTime();
    if (onOnline) onOnline();
  });

  window.addEventListener("offline", () => {
    if (onOffline) onOffline();
  });
}

