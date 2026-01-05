export default function BulkOperations({ selectedItems, onBulkRemove, onBulkDelete, onClearSelection }) {
  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 flex items-center gap-4">
        <div className="text-white font-semibold">
          {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBulkRemove}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg font-semibold text-sm transition-colors"
          >
            Remove Selected
          </button>
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-semibold text-sm transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={onClearSelection}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

