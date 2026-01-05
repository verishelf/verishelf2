// Saved searches management
export function getSavedSearches() {
  const saved = localStorage.getItem("verishelf-saved-searches");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveSearch(name, filters) {
  const searches = getSavedSearches();
  searches.push({
    id: Date.now(),
    name,
    filters,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("verishelf-saved-searches", JSON.stringify(searches));
  return searches;
}

export function deleteSavedSearch(id) {
  const searches = getSavedSearches();
  const filtered = searches.filter((s) => s.id !== id);
  localStorage.setItem("verishelf-saved-searches", JSON.stringify(filtered));
  return filtered;
}

