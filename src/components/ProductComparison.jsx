import { daysUntilExpiry } from "../utils/expiry";
import ExpiryBadge from "./ExpiryBadge";

export default function ProductComparison({ items, onClose }) {
  if (items.length === 0) return null;

  const fields = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price" },
    { key: "expiry", label: "Expiry Date" },
    { key: "status", label: "Status" },
    { key: "location", label: "Location" },
    { key: "supplier", label: "Supplier" },
    { key: "batchNumber", label: "Batch/Lot" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Product Comparison</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Field</th>
                  {items.map((item, index) => (
                    <th key={item.id} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase min-w-[200px]">
                      Product {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-slate-800">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-300">{field.label}</td>
                    {items.map((item) => (
                      <td key={item.id} className="px-4 py-3 text-sm text-white">
                        {field.key === "expiry" ? (
                          <div>
                            {new Date(item.expiry).toLocaleDateString()}
                            <div className="text-xs text-slate-500 mt-1">
                              {daysUntilExpiry(item.expiry)} days
                            </div>
                          </div>
                        ) : field.key === "status" ? (
                          <ExpiryBadge expiry={item.expiry} />
                        ) : field.key === "price" ? (
                          `$${item.price?.toFixed(2) || "0.00"}`
                        ) : (
                          item[field.key] || <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

