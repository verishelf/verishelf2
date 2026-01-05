import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { daysUntilExpiry } from "../utils/expiry";

export default function ExpiryCalendar({ items, onDateClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get items expiring on each day
  const getItemsForDate = (date) => {
    return items.filter((item) => {
      if (item.removed) return false;
      const expiry = new Date(item.expiry);
      return isSameDay(expiry, date);
    });
  };

  const getDateStatus = (date) => {
    const itemsForDate = getItemsForDate(date);
    if (itemsForDate.length === 0) return null;

    const today = new Date();
    const hasExpired = itemsForDate.some((item) => new Date(item.expiry) < today);
    const hasExpiringSoon = itemsForDate.some((item) => {
      const days = daysUntilExpiry(item.expiry);
      return days >= 0 && days <= 3;
    });

    if (hasExpired) return "expired";
    if (hasExpiringSoon) return "warning";
    return "safe";
  };

  return (
    <div className="card-gradient rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Expiry Calendar</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-white mb-1">
          {format(currentMonth, "MMMM yyyy")}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          const status = getDateStatus(day);
          const itemsForDate = getItemsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick && onDateClick(day, itemsForDate)}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all font-semibold
                ${!isCurrentMonth ? "opacity-30" : ""}
                ${isToday ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20" : "border-slate-700"}
                ${status === "expired" ? "bg-red-500/40 border-red-400 shadow-lg shadow-red-500/30 text-white" : ""}
                ${status === "warning" ? "bg-yellow-500/40 border-yellow-400 shadow-lg shadow-yellow-500/30 text-white" : ""}
                ${status === "safe" ? "bg-emerald-500/30 border-emerald-400 shadow-lg shadow-emerald-500/20 text-white" : ""}
                ${status ? "hover:scale-105 cursor-pointer" : "hover:bg-slate-800 text-slate-300"}
                ${!status && isCurrentMonth ? "text-white" : ""}
              `}
            >
              <div className="text-sm font-bold">{format(day, "d")}</div>
              {itemsForDate.length > 0 && (
                <div className="text-xs font-semibold mt-1 opacity-90">{itemsForDate.length} item(s)</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/40 border-2 border-red-400 rounded shadow shadow-red-500/30"></div>
          <span className="text-slate-300 font-medium">Expired</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/40 border-2 border-yellow-400 rounded shadow shadow-yellow-500/30"></div>
          <span className="text-slate-300 font-medium">Expiring Soon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/30 border-2 border-emerald-400 rounded shadow shadow-emerald-500/20"></div>
          <span className="text-slate-300 font-medium">Safe</span>
        </div>
      </div>
    </div>
  );
}

