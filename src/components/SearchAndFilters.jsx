import { useState, useEffect } from "react";

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  searchInputRef,
  showExceptionsOnly = false,
  onToggleExceptions = null,
}) {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute("data-theme") || "dark";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const inputClass = `w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
    theme === "light"
      ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
      : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`;
  const iconClass = `absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "light" ? "text-gray-500" : "text-slate-400"}`;

  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Search Products</label>
          <div className="relative">
            <svg
              className={iconClass}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, barcode, category, supplier... (Ctrl+F)"
              className={`pl-10 ${inputClass}`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={labelClass}>Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={inputClass}
          >
            <option value="all">All Status</option>
            <option value="expired">Expired</option>
            <option value="warning">Expiring Soon</option>
            <option value="safe">Safe</option>
          </select>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div>
            <label className={labelClass}>Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className={inputClass}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Manager Exception View Toggle */}
      {onToggleExceptions && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={onToggleExceptions}
            className={`w-full px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              showExceptionsOnly
                ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-slate-800 border-2 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-semibold">
              {showExceptionsOnly ? "Show All Items" : "Manager View: Exceptions Only"}
            </span>
          </button>
          {showExceptionsOnly && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              Showing only expired and expiring items that need attention
            </p>
          )}
        </div>
      )}
    </div>
  );
}

