import { useState } from "react";
import ExpiryBadge from "./ExpiryBadge";
import RemoveButton from "./RemoveButton";
import ImageModal from "./ImageModal";
import QuickActionsMenu from "./QuickActionsMenu";
import { daysUntilExpiry } from "../utils/expiry";
import { printLabel } from "../utils/print";

export default function InventoryTable({
  items,
  onRemove,
  onDelete,
  onEdit,
  onDuplicate,
  onShowQR,
  onShowHistory,
  selectedItems = [],
  onSelectionChange,
  isInspector = false,
}) {
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedImage, setSelectedImage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(items.filter((i) => !i.removed).map((i) => i.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "expiry":
        aVal = new Date(a.expiry || a.expiryDate);
        bVal = new Date(b.expiry || b.expiryDate);
        break;
      case "quantity":
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case "status":
        aVal = daysUntilExpiry(a.expiry || a.expiryDate);
        bVal = daysUntilExpiry(b.expiry || b.expiryDate);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No products found</h3>
        <p className="text-slate-500">Add your first product to start tracking expiry dates</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            {onSelectionChange && !isInspector && (
              <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={items.filter((i) => !i.removed).length > 0 && selectedItems.length === items.filter((i) => !i.removed).length}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 text-emerald-500 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                />
              </th>
            )}
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
              Photo
            </th>
            <th
              className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Product
                <SortIcon column="name" />
              </div>
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Barcode
            </th>
            <th
              className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center gap-1">
                Qty
                <SortIcon column="quantity" />
              </div>
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Price
            </th>
            <th
              className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => handleSort("expiry")}
            >
              <div className="flex items-center gap-1">
                Expiry
                <SortIcon column="expiry" />
              </div>
            </th>
            <th
              className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-1">
                Status
                <SortIcon column="status" />
              </div>
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Location
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {sortedItems.map((item) => {
            const expiryValue = item.expiry || item.expiryDate;
            const days = expiryValue ? daysUntilExpiry(expiryValue) : null;
            return (
              <tr
                key={item.id}
                className={`hover:bg-slate-900/50 transition-colors ${item.removed ? 'opacity-50' : ''}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ item, position: { x: e.clientX, y: e.clientY } });
                }}
              >
                {onSelectionChange && !isInspector && (
                  <td className="px-2 py-2 whitespace-nowrap">
                    {!item.removed && (
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-3.5 h-3.5 text-emerald-500 bg-slate-950 border-slate-700 rounded focus:ring-emerald-500"
                      />
                    )}
                  </td>
                )}
                <td className="px-2 py-2 whitespace-nowrap">
                  {item.image ? (
                    <button
                      onClick={() => setSelectedImage(item.image)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs font-medium text-white">{item.name}</div>
                  {item.variant && (
                    <div className="text-[10px] text-slate-400 mt-0.5">Variant: {item.variant}</div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1 py-0.5 bg-emerald-500/10 text-emerald-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-[10px] text-slate-500">+{item.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-slate-400">
                    {item.category || <span className="text-slate-600 italic">—</span>}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-slate-400 font-mono">
                    {item.barcode || (
                      <span className="text-slate-600 italic">—</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-white">
                    {item.quantity} {item.unit || "pcs"}
                  </div>
                  {item.reorderPoint && item.quantity <= item.reorderPoint && (
                    <div className="text-[10px] text-yellow-400 mt-0.5">⚠ Low</div>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-white">
                    {(item.price || item.cost) ? `$${(item.price || item.cost).toFixed(2)}` : "—"}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-white">
                    {(item.expiry || item.expiryDate) ? new Date(item.expiry || item.expiryDate).toLocaleDateString() : "—"}
                  </div>
                  {(item.expiry || item.expiryDate) && days >= 0 && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {days === 0 ? "Today" : `${days}d`}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <ExpiryBadge expiry={item.expiry || item.expiryDate} />
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-xs text-slate-400">{item.location || "Store #001"}</div>
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1 flex-wrap justify-end sm:justify-start max-w-full">
                    {!isInspector && onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 sm:p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {!isInspector && onDuplicate && (
                      <button
                        onClick={() => onDuplicate(item.id)}
                        className="p-1.5 sm:p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="Duplicate"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                    {onShowQR && (
                      <button
                        onClick={() => onShowQR(item)}
                        className="p-1.5 sm:p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="QR Code"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => printLabel(item)}
                      className="p-1.5 sm:p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                      title="Print"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-2M7 13h10" />
                      </svg>
                    </button>
                    {onShowHistory && (
                      <button
                        onClick={() => onShowHistory(item)}
                        className="p-1.5 sm:p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="History"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    {!isInspector && (
                      <>
                        <RemoveButton removed={item.removed} onRemove={() => onRemove(item.id)} />
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 sm:p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-all duration-200 hover:scale-105 flex-shrink-0"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      {contextMenu && (
        <QuickActionsMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onDelete={onDelete}
          onShowQR={onShowQR}
          onShowHistory={onShowHistory}
          onPrint={(item) => {
            const { printLabel } = require("../utils/print");
            printLabel(item);
          }}
        />
      )}
    </div>
  );
}
