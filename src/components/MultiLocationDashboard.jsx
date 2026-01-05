// Multi-Location Control - Regional dashboards, performance scoring, SLA tracking
import { useMemo } from "react";
import { getStatus, daysUntilExpiry } from "../utils/expiry";
import { getAuditLogs } from "../utils/audit";
import { checkSLACompliance } from "../utils/alerts";

export default function MultiLocationDashboard({ items, stores, settings }) {
  const locationStats = useMemo(() => {
    const stats = {};

    stores.forEach((store) => {
      const storeItems = items.filter((item) => item.location === store.name && !item.removed);
      const expired = storeItems.filter((item) => getStatus(item.expiry) === "EXPIRED");
      const warning = storeItems.filter((item) => getStatus(item.expiry) === "WARNING");
      const safe = storeItems.filter((item) => getStatus(item.expiry) === "SAFE");

      // Calculate performance score (0-100)
      const totalItems = storeItems.length;
      const expiredCount = expired.length;
      const warningCount = warning.length;
      
      let performanceScore = 100;
      if (totalItems > 0) {
        performanceScore -= (expiredCount / totalItems) * 50; // -50 points for expired
        performanceScore -= (warningCount / totalItems) * 25; // -25 points for warning
      }

      // Calculate SLA compliance
      const removalLogs = getAuditLogs({ location: store.name, action: "removed" });
      const slaViolations = checkSLACompliance(expired, removalLogs);
      const slaCompliance = expired.length > 0 
        ? ((expired.length - slaViolations.length) / expired.length) * 100 
        : 100;

      // Calculate total value
      const totalValue = storeItems.reduce((sum, item) => {
        return sum + (item.price || 0) * item.quantity;
      }, 0);

      // Calculate expired value
      const expiredValue = expired.reduce((sum, item) => {
        return sum + (item.price || 0) * item.quantity;
      }, 0);

      stats[store.name] = {
        store,
        totalItems,
        expired: expired.length,
        warning: warning.length,
        safe: safe.length,
        performanceScore: Math.max(0, Math.round(performanceScore)),
        slaCompliance: Math.round(slaCompliance),
        slaViolations: slaViolations.length,
        totalValue,
        expiredValue,
        items: storeItems,
      };
    });

    return stats;
  }, [items, stores]);

  const overallStats = useMemo(() => {
    const allStats = Object.values(locationStats);
    if (allStats.length === 0) {
      return {
        totalStores: 0,
        averagePerformance: 0,
        averageSLA: 0,
        totalItems: 0,
        totalExpired: 0,
      };
    }

    return {
      totalStores: allStats.length,
      averagePerformance: Math.round(
        allStats.reduce((sum, s) => sum + s.performanceScore, 0) / allStats.length
      ),
      averageSLA: Math.round(
        allStats.reduce((sum, s) => sum + s.slaCompliance, 0) / allStats.length
      ),
      totalItems: allStats.reduce((sum, s) => sum + s.totalItems, 0),
      totalExpired: allStats.reduce((sum, s) => sum + s.expired, 0),
    };
  }, [locationStats]);

  const getPerformanceColor = (score) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getPerformanceBg = (score) => {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/30";
    if (score >= 70) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Total Stores</div>
          <div className="text-2xl font-bold text-white">{overallStats.totalStores}</div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Avg Performance</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(overallStats.averagePerformance)}`}>
            {overallStats.averagePerformance}%
          </div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Avg SLA Compliance</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(overallStats.averageSLA)}`}>
            {overallStats.averageSLA}%
          </div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-white">{overallStats.totalItems}</div>
        </div>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => {
          const stats = locationStats[store.name] || {
            totalItems: 0,
            expired: 0,
            warning: 0,
            safe: 0,
            performanceScore: 0,
            slaCompliance: 0,
            slaViolations: 0,
            totalValue: 0,
            expiredValue: 0,
          };

          return (
            <div key={store.id} className="card-gradient rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{store.name}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceBg(stats.performanceScore)} ${getPerformanceColor(stats.performanceScore)}`}>
                  {stats.performanceScore}%
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Items</span>
                  <span className="text-white font-semibold">{stats.totalItems}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Expired</span>
                  <span className="text-red-400 font-semibold">{stats.expired}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Expiring Soon</span>
                  <span className="text-yellow-400 font-semibold">{stats.warning}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Safe</span>
                  <span className="text-emerald-400 font-semibold">{stats.safe}</span>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">SLA Compliance</span>
                    <span className={`font-semibold ${getPerformanceColor(stats.slaCompliance)}`}>
                      {stats.slaCompliance}%
                    </span>
                  </div>
                  {stats.slaViolations > 0 && (
                    <div className="text-xs text-red-400">
                      {stats.slaViolations} violation(s) detected
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Value</span>
                    <span className="text-white font-semibold">
                      ${stats.totalValue.toFixed(2)}
                    </span>
                  </div>
                  {stats.expiredValue > 0 && (
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-500">Expired Value</span>
                      <span className="text-red-400">
                        ${stats.expiredValue.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

