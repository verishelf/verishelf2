import { useState, useEffect } from "react";
import { getStores, saveStores, addStore, deleteStore, updateStore } from "../utils/stores";

export default function StoreManager({ onClose, onStoresUpdate, maxLocations }) {
  const [stores, setStores] = useState(getStores());
  const [newStoreName, setNewStoreName] = useState("");
  const [editingStore, setEditingStore] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  useEffect(() => {
    setStores(getStores());
  }, []);

  const handleAddStore = () => {
    const name = newStoreName.trim();
    if (!name) return;
    
    // Check if store name already exists
    if (stores.some(s => (typeof s === 'string' ? s : s.name) === name)) {
      alert('Store name already exists');
      return;
    }
    
    // Check location limit
    const currentLocationCount = stores.length;
    if (maxLocations && currentLocationCount >= maxLocations) {
      setShowUpgradeMessage(true);
      return;
    }
    
    const updated = addStore(name);
    setStores(updated);
    setNewStoreName("");
    onStoresUpdate?.(updated);
  };

  const handleDeleteStore = (store) => {
    const storeName = typeof store === 'string' ? store : store.name;
    if (window.confirm(`Delete store "${storeName}"? This won't affect existing items.`)) {
      const updated = deleteStore(storeName);
      setStores(updated);
      onStoresUpdate?.(updated);
    }
  };

  const handleStartEdit = (store) => {
    const storeName = typeof store === 'string' ? store : store.name;
    setEditingStore(storeName);
    setEditValue(storeName);
  };

  const handleSaveEdit = () => {
    const newName = editValue.trim();
    if (newName && newName !== editingStore) {
      const nameExists = stores.some(s => {
        const name = typeof s === 'string' ? s : s.name;
        return name === newName && name !== editingStore;
      });
      if (!nameExists) {
        const updated = updateStore(editingStore, newName);
        setStores(updated);
        setEditingStore(null);
        setEditValue("");
        onStoresUpdate?.(updated);
      } else {
        alert("Store name already exists");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingStore(null);
    setEditValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Manage Stores</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Location Limit Info */}
          {maxLocations && (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{stores.length}</span> of <span className="font-semibold text-emerald-400">{maxLocations}</span> locations used
                  </p>
                  {stores.length >= maxLocations && (
                    <p className="text-xs text-red-400 mt-1">You've reached your location limit</p>
                  )}
                </div>
                {stores.length >= maxLocations && (
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors text-sm"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Upgrade Message Modal */}
          {showUpgradeMessage && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full mx-4 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Location Limit Reached</h3>
                <p className="text-slate-300 mb-6">
                  You've reached your maximum of <span className="font-semibold text-emerald-400">{maxLocations} locations</span> on your current plan.
                  Upgrade your plan to add more locations.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowUpgradeMessage(false)}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Store */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddStore()}
              placeholder="Enter store name (e.g., Store #001, Main Branch)"
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 rounded-lg outline-none transition-colors text-white placeholder-slate-500"
              disabled={maxLocations && stores.length >= maxLocations}
            />
            <button
              onClick={handleAddStore}
              disabled={maxLocations && stores.length >= maxLocations}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Store
            </button>
          </div>

          {/* Store List */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white mb-3">Existing Stores</h3>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No stores added yet. Add your first store above.</p>
              </div>
            ) : (
              stores.map((store) => {
                const storeName = typeof store === 'string' ? store : store.name;
                const storeId = typeof store === 'string' ? store : store.id;
                return (
                <div
                  key={storeId || storeName}
                  className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  {editingStore === storeName ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center gap-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white font-medium">{storeName}</span>
                      </div>
                      <button
                        onClick={() => handleStartEdit(store)}
                        className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              );
              })
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

