// Audit Logs Modal Component
import { useState, useMemo } from "react";
import { getAuditLogs, exportAuditLogsToCSV, exportAuditLogsToPDF, getComplianceReport } from "../utils/audit";

export default function AuditLogsModal({ onClose }) {
  const [filters, setFilters] = useState({
    action: "",
    location: "",
    startDate: "",
    endDate: "",
  });
  const [selectedReport, setSelectedReport] = useState(null);

  const logs = useMemo(() => {
    return getAuditLogs(filters);
  }, [filters]);

  const complianceReport = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      return getComplianceReport(filters.startDate, filters.endDate);
    }
    return null;
  }, [filters.startDate, filters.endDate]);

  const handleExportCSV = () => {
    exportAuditLogsToCSV(logs);
  };

  const handleExportPDF = async () => {
    await exportAuditLogsToPDF(logs);
  };

  const getActionColor = (action) => {
    const colors = {
      added: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      removed: "bg-red-500/10 text-red-400 border-red-500/30",
      edited: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      deleted: "bg-red-500/10 text-red-400 border-red-500/30",
      restored: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    return colors[action] || "bg-slate-500/10 text-slate-400 border-slate-500/30";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Audit & Compliance Logs</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="">All Actions</option>
                <option value="added">Added</option>
                <option value="removed">Removed</option>
                <option value="edited">Edited</option>
                <option value="deleted">Deleted</option>
                <option value="restored">Restored</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Filter by location"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Export PDF
            </button>
            {complianceReport && (
              <button
                onClick={() => setSelectedReport(complianceReport)}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                View Compliance Report
              </button>
            )}
          </div>

          {/* Compliance Report */}
          {selectedReport && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-4">Compliance Report</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Total Actions</div>
                  <div className="text-xl font-bold text-white">{selectedReport.totalActions}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Removals</div>
                  <div className="text-xl font-bold text-white">{selectedReport.removalActions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Photos Attached</div>
                  <div className="text-xl font-bold text-white">{selectedReport.photosAttached}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Locations</div>
                  <div className="text-xl font-bold text-white">{Object.keys(selectedReport.actionsByLocation).length}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="mt-4 text-sm text-slate-400 hover:text-white"
              >
                Hide Report
              </button>
            </div>
          )}

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{log.itemName || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {log.userName}
                        {log.userEmail && (
                          <div className="text-xs text-slate-500">{log.userEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{log.location || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{log.notes || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

