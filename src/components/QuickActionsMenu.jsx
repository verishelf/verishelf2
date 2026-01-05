import { useEffect, useRef } from "react";

export default function QuickActionsMenu({ item, position, onClose, onEdit, onDuplicate, onRemove, onDelete, onShowQR, onShowHistory, onPrint }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!item || !position) return null;

  const actions = [
    { label: "Edit", icon: "✏️", onClick: () => { onEdit(item); onClose(); } },
    { label: "Duplicate", icon: "📋", onClick: () => { onDuplicate(item.id); onClose(); } },
    { label: "Generate QR Code", icon: "🔲", onClick: () => { onShowQR(item); onClose(); } },
    { label: "View History", icon: "🕐", onClick: () => { onShowHistory(item); onClose(); } },
    { label: "Print Label", icon: "🖨️", onClick: () => { onPrint(item); onClose(); } },
    { label: "Remove from Shelf", icon: "📤", onClick: () => { onRemove(item.id); onClose(); }, divider: true },
    { label: "Delete", icon: "🗑️", onClick: () => { onDelete(item.id); onClose(); }, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {actions.map((action, index) => (
        <div key={index}>
          {action.divider && <div className="border-t border-slate-800 my-1"></div>}
          <button
            onClick={action.onClick}
            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${
              action.danger
                ? "text-red-400 hover:bg-red-500/10"
                : "text-white hover:bg-slate-800"
            }`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

