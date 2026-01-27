import { useEffect, useMemo, useState } from "react";
import { getAlerts } from "../utils/alerts";
import { USE_CORE_API } from "../config/features";
import { getExpiryAlerts } from "../api/expiry";

export default function AlertsPanel({ items, settings, onItemClick }) {
  const [alerts, setAlerts] = useState([]);

  // Fallback / legacy calculation (client-side)
  const legacyAlerts = useMemo(() => getAlerts(items, settings), [items, settings]);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      // When feature flag is off, keep existing behaviour entirely client-side
      if (!USE_CORE_API) {
        if (!cancelled) setAlerts(legacyAlerts);
        return;
      }

      try {
        const apiAlerts = await getExpiryAlerts();
        if (!cancelled) {
          // Core API is the source of truth when enabled
          setAlerts(Array.isArray(apiAlerts) ? apiAlerts : []);
        }
      } catch (error) {
        console.error("Error loading expiry alerts from Core API, falling back to legacy alerts:", error);
        if (!cancelled) {
          // Non-breaking fallback to previous logic
          setAlerts(legacyAlerts);
        }
      }
    }

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [items, settings, legacyAlerts]);

  if (alerts.length === 0) {
    return (
      <div className="card-gradient rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
        <p className="text-slate-400">No alerts at this time</p>
      </div>
    );
  }

  const groupedAlerts = {
    high: alerts.filter((a) => a.priority === "high"),
    medium: alerts.filter((a) => a.priority === "medium"),
    low: alerts.filter((a) => a.priority === "low"),
  };

  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Alerts & Reminders</h3>
        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
          {alerts.length} alert{alerts.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {groupedAlerts.high.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-red-400 mb-2">High Priority</div>
            {groupedAlerts.high.map((alert, index) => (
              <div
                key={index}
                onClick={() => onItemClick && onItemClick(alert.item)}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-2 cursor-pointer hover:bg-red-500/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{alert.item.name}</div>
                    <div className="text-sm text-red-300 mt-1">{alert.message}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {alert.daysUntil !== undefined && `${Math.abs(alert.daysUntil)} day(s)`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedAlerts.medium.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-yellow-400 mb-2">Medium Priority</div>
            {groupedAlerts.medium.map((alert, index) => (
              <div
                key={index}
                onClick={() => onItemClick && onItemClick(alert.item)}
                className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-2 cursor-pointer hover:bg-yellow-500/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{alert.item.name}</div>
                    <div className="text-sm text-yellow-300 mt-1">{alert.message}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {alert.daysUntil !== undefined && `${alert.daysUntil} day(s)`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

