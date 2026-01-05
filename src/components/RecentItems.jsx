import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export default function RecentItems({ items, onItemClick }) {
  const recentItems = useMemo(() => {
    return items
      .filter((i) => !i.removed)
      .sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0))
      .slice(0, 10);
  }, [items]);

  if (recentItems.length === 0) {
    return (
      <div className="card-gradient rounded-2xl p-6 text-center">
        <p className="text-slate-400">No recent items</p>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Recent Items</h3>
      <div className="space-y-2">
        {recentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick && onItemClick(item)}
            className="w-full p-3 bg-slate-950 hover:bg-slate-900 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {item.addedAt
                    ? `Added ${formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })}`
                    : "Recently added"}
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {new Date(item.expiry).toLocaleDateString()}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

