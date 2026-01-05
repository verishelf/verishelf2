export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  searchInputRef,
}) {
  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Search Products</label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
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
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 rounded-lg outline-none transition-colors text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 rounded-lg outline-none transition-colors text-white"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 rounded-lg outline-none transition-colors text-white"
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
    </div>
  );
}

