import { useMemo } from "react";
import { getStatus } from "../utils/expiry";
import { daysUntilExpiry } from "../utils/expiry";

export default function AnalyticsCharts({ items }) {
  const analytics = useMemo(() => {
    const activeItems = items.filter((i) => !i.removed);
    
    // Expiry distribution
    const expired = activeItems.filter((i) => getStatus(i.expiry) === "EXPIRED").length;
    const warning = activeItems.filter((i) => getStatus(i.expiry) === "WARNING").length;
    const safe = activeItems.filter((i) => getStatus(i.expiry) === "SAFE").length;
    
    // Category distribution
    const categoryCounts = {};
    activeItems.forEach((item) => {
      const cat = item.category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    // Location distribution
    const locationCounts = {};
    activeItems.forEach((item) => {
      const loc = item.location || "Unknown";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    // Days until expiry distribution
    const daysDistribution = { "0-3": 0, "4-7": 0, "8-30": 0, "30+": 0 };
    activeItems.forEach((item) => {
      const days = daysUntilExpiry(item.expiry);
      if (days < 0) daysDistribution["0-3"]++;
      else if (days <= 3) daysDistribution["0-3"]++;
      else if (days <= 7) daysDistribution["4-7"]++;
      else if (days <= 30) daysDistribution["8-30"]++;
      else daysDistribution["30+"]++;
    });
    
    return {
      expiryDistribution: { expired, warning, safe },
      categoryCounts,
      locationCounts,
      daysDistribution,
    };
  }, [items]);

  const BarChart = ({ data, color = "emerald" }) => {
    const max = Math.max(...Object.values(data));
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">{key}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className={`bg-${color}-500 h-2 rounded-full transition-all`}
                style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card-gradient rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Expiry Status Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-slate-300">Expired</span>
            </div>
            <span className="text-white font-bold">{analytics.expiryDistribution.expired}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-slate-300">Warning</span>
            </div>
            <span className="text-white font-bold">{analytics.expiryDistribution.warning}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-slate-300">Safe</span>
            </div>
            <span className="text-white font-bold">{analytics.expiryDistribution.safe}</span>
          </div>
        </div>
      </div>

      <div className="card-gradient rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Days Until Expiry</h3>
        <BarChart data={analytics.daysDistribution} color="emerald" />
      </div>

      {Object.keys(analytics.categoryCounts).length > 0 && (
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">By Category</h3>
          <BarChart data={analytics.categoryCounts} color="blue" />
        </div>
      )}

      {Object.keys(analytics.locationCounts).length > 0 && (
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">By Location</h3>
          <BarChart data={analytics.locationCounts} color="purple" />
        </div>
      )}
    </div>
  );
}

