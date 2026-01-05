export default function RemoveButton({ onRemove, removed }) {
  if (removed) {
    return (
      <div className="flex items-center gap-2 text-emerald-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-semibold">Removed</span>
      </div>
    );
  }

  return (
    <button
      onClick={onRemove}
      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-all duration-200 hover:scale-105"
      title="Remove"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
