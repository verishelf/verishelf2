import { useState, useEffect } from "react";
import { getSavedSearches, deleteSavedSearch } from "../utils/savedSearches";

export default function SavedSearches({ onLoadSearch }) {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    setSearches(getSavedSearches());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Delete this saved search?")) {
      setSearches(deleteSavedSearch(id));
    }
  };

  if (searches.length === 0) {
    return (
      <div className="card-gradient rounded-2xl p-6 text-center">
        <p className="text-slate-400">No saved searches</p>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Saved Searches</h3>
      <div className="space-y-2">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800"
          >
            <button
              onClick={() => onLoadSearch && onLoadSearch(search.filters)}
              className="flex-1 text-left text-white hover:text-emerald-400 transition-colors"
            >
              <div className="font-semibold">{search.name}</div>
              <div className="text-xs text-slate-400">
                {Object.entries(search.filters)
                  .filter(([_, v]) => v)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ") || "All items"}
              </div>
            </button>
            <button
              onClick={() => handleDelete(search.id)}
              className="ml-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

