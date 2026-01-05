export default function AlertBanner({ count }) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-red-400 font-bold text-lg">
            {count} {count === 1 ? "Item" : "Items"} Expired
          </div>
          <div className="text-red-300/80 text-sm">
            Immediate action required. Remove expired products from shelves.
          </div>
        </div>
        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-semibold text-sm">
          URGENT
        </div>
      </div>
    </div>
  );
}

