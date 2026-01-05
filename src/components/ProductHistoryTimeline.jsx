import { getHistory } from "../utils/history";
import { format } from "date-fns";

export default function ProductHistoryTimeline({ itemId, itemName }) {
  const history = getHistory().filter((entry) => entry.itemId === itemId);

  const getIcon = (type) => {
    switch (type) {
      case "added":
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "edited":
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "removed":
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case "deleted":
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "restored":
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      added: "Added",
      edited: "Edited",
      removed: "Removed from Shelf",
      deleted: "Deleted",
      restored: "Restored",
    };
    return labels[type] || type;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No history available for this item</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              {getIcon(entry.type)}
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 h-full bg-slate-800 mt-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-white">{getTypeLabel(entry.type)}</div>
              <div className="text-sm text-slate-400">
                {format(new Date(entry.timestamp), "MMM d, yyyy HH:mm")}
              </div>
            </div>
            <div className="text-sm text-slate-300">{entry.itemName}</div>
            {entry.details && (
              <div className="text-xs text-slate-500 mt-1">
                {typeof entry.details === "string" ? entry.details : JSON.stringify(entry.details)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

