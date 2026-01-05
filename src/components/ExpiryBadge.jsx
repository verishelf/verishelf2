import { getStatus } from "../utils/expiry";

export default function ExpiryBadge({ expiry }) {
  const status = getStatus(expiry);

  const styles = {
    EXPIRED: "bg-red-500/20 text-red-400 border-red-500/30",
    WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    SAFE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const icons = {
    EXPIRED: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    WARNING: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    SAFE: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}
