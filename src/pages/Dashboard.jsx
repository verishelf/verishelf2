import { useState, useMemo, useEffect } from "react";
import AddItem from "../components/AddItem";
import InventoryTable from "../components/InventoryTable";
import StatsCards from "../components/StatsCards";
import LocationSelector from "../components/LocationSelector";
import SearchAndFilters from "../components/SearchAndFilters";
import AlertBanner from "../components/AlertBanner";
import { getStatus } from "../utils/expiry";

export default function Dashboard() {
  const [items, setItems] = useState(() => {
    // Load from localStorage or start with empty array
    const saved = localStorage.getItem("verishelf-items");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("verishelf-items", JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems([
      ...items,
      {
        ...item,
        id: Date.now(),
        location: selectedLocation === "All Locations" ? "Store #001" : selectedLocation,
        addedAt: new Date().toISOString(),
        removed: false,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, removed: true, removedAt: new Date().toISOString() } : i
      )
    );
  };

  const deleteItem = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this item?")) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === "All Locations" || item.location === selectedLocation;
      const matchesStatus = statusFilter === "all" || getStatus(item.expiry) === statusFilter.toUpperCase();
      
      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [items, searchQuery, selectedLocation, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeItems = items.filter((i) => !i.removed);
    const expired = activeItems.filter((i) => getStatus(i.expiry) === "EXPIRED").length;
    const warning = activeItems.filter((i) => getStatus(i.expiry) === "WARNING").length;
    const safe = activeItems.filter((i) => getStatus(i.expiry) === "SAFE").length;
    const totalValue = activeItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    return {
      total: activeItems.length,
      expired,
      warning,
      safe,
      totalValue,
      locations: [...new Set(items.map((i) => i.location))].length || 1,
    };
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-950/95 backdrop-blur-lg z-50 border-b border-slate-800 supports-[backdrop-filter]:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="gradient-text">VeriShelf</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></div>
              <span>24/7 Monitoring Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Alert Banner */}
        {stats.expired > 0 && (
          <AlertBanner count={stats.expired} />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Expiry <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Real-time tracking and management of shelf expiry across all locations
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Controls Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
          <div>
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              locations={stats.locations}
            />
          </div>
        </div>

        {/* Add Item Form */}
        <div className="mb-8">
          <AddItem onAdd={addItem} selectedLocation={selectedLocation} />
        </div>

        {/* Inventory Table */}
        <div className="card-gradient rounded-2xl p-6 card-gradient-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
            <div className="text-sm text-slate-400">
              Showing <span className="text-emerald-400 font-semibold">{filteredItems.length}</span> items • <span className="text-emerald-400 font-semibold">{stats.total}</span> active
            </div>
          </div>
          <InventoryTable items={filteredItems} onRemove={removeItem} onDelete={deleteItem} />
        </div>
    </main>
    </div>
  );
}
