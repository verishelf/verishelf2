// Store management
const DEFAULT_STORES = [
  { id: 1, name: "Store #001" },
  { id: 2, name: "Store #002" },
  { id: 3, name: "Store #003" }
];

export function getStores() {
  const saved = localStorage.getItem("verishelf-stores");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Handle legacy format (array of strings)
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          // Convert old format to new format
          return parsed.map((name, index) => ({ id: index + 1, name }));
        }
        // Already in new format
        return parsed;
      }
      return DEFAULT_STORES;
    } catch {
      return DEFAULT_STORES;
    }
  }
  return DEFAULT_STORES;
}

export function saveStores(stores) {
  localStorage.setItem("verishelf-stores", JSON.stringify(stores));
}

export function addStore(storeName) {
  const stores = getStores();
  // Check if store already exists
  if (!stores.some(s => s.name === storeName || (typeof s === 'string' && s === storeName))) {
    const newId = Math.max(...stores.map(s => s.id || 0), 0) + 1;
    stores.push({ id: newId, name: storeName });
    saveStores(stores);
  }
  return stores;
}

export function deleteStore(storeName) {
  const stores = getStores();
  const filtered = stores.filter(s => {
    const name = typeof s === 'string' ? s : s.name;
    return name !== storeName;
  });
  saveStores(filtered);
  return filtered;
}

export function updateStore(oldName, newName) {
  const stores = getStores();
  const index = stores.findIndex(s => {
    const name = typeof s === 'string' ? s : s.name;
    return name === oldName;
  });
  if (index >= 0) {
    stores[index] = { ...stores[index], name: newName };
    if (typeof stores[index] === 'string') {
      stores[index] = { id: index + 1, name: newName };
    } else {
      stores[index].name = newName;
    }
    saveStores(stores);
  }
  return stores;
}

