import { useMemo } from "react";
import { getStatus } from "../utils/expiry";

export default function CostAnalysis({ items }) {
  const analysis = useMemo(() => {
    const activeItems = items.filter((i) => !i.removed);
    const expiredItems = activeItems.filter((i) => getStatus(i.expiry) === "EXPIRED");
    const warningItems = activeItems.filter((i) => getStatus(i.expiry) === "WARNING");

    const totalValue = activeItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const expiredValue = expiredItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const warningValue = warningItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    // Category analysis
    const categoryAnalysis = {};
    activeItems.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!categoryAnalysis[cat]) {
        categoryAnalysis[cat] = { count: 0, value: 0, items: [] };
      }
      categoryAnalysis[cat].count += item.quantity;
      categoryAnalysis[cat].value += (item.price || 0) * item.quantity;
      categoryAnalysis[cat].items.push(item);
    });

    // Supplier analysis
    const supplierAnalysis = {};
    activeItems.forEach((item) => {
      if (!item.supplier) return;
      if (!supplierAnalysis[item.supplier]) {
        supplierAnalysis[item.supplier] = { count: 0, value: 0, items: [] };
      }
      supplierAnalysis[item.supplier].count += item.quantity;
      supplierAnalysis[item.supplier].value += (item.price || 0) * item.quantity;
      supplierAnalysis[item.supplier].items.push(item);
    });

    return {
      totalValue,
      expiredValue,
      warningValue,
      safeValue: totalValue - expiredValue - warningValue,
      categoryAnalysis,
      supplierAnalysis,
      totalItems: activeItems.length,
      expiredCount: expiredItems.length,
      warningCount: warningItems.length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Total Inventory Value</div>
          <div className="text-2xl font-bold gradient-text">${analysis.totalValue.toFixed(2)}</div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Expired Value (Loss)</div>
          <div className="text-2xl font-bold text-red-400">${analysis.expiredValue.toFixed(2)}</div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">At Risk Value</div>
          <div className="text-2xl font-bold text-yellow-400">${analysis.warningValue.toFixed(2)}</div>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Safe Value</div>
          <div className="text-2xl font-bold text-emerald-400">${analysis.safeValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Category Analysis */}
      {Object.keys(analysis.categoryAnalysis).length > 0 && (
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Value by Category</h3>
          <div className="space-y-3">
            {Object.entries(analysis.categoryAnalysis)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([category, data]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{category}</span>
                    <span className="text-white font-semibold">${data.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(data.value / analysis.totalValue) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {data.count} items
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Supplier Analysis */}
      {Object.keys(analysis.supplierAnalysis).length > 0 && (
        <div className="card-gradient rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Value by Supplier</h3>
          <div className="space-y-3">
            {Object.entries(analysis.supplierAnalysis)
              .sort((a, b) => b[1].value - a[1].value)
              .map(([supplier, data]) => (
                <div key={supplier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{supplier}</span>
                    <span className="text-white font-semibold">${data.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(data.value / analysis.totalValue) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {data.count} items
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

