export default function InspectorBanner({ owner, scope }) {
  if (!owner) return null;

  const expiresAt = scope?.expiresAt || scope?.end || null;
  const expiresLabel = expiresAt ? new Date(expiresAt).toLocaleString() : null;

  return (
    <div className="mb-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 00-7.06 17.06A10 10 0 1012 2z" />
            </svg>
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Inspector Mode – Read Only
          </div>
          <div className="text-sm text-amber-100 mt-1">
            Viewing compliance data for{" "}
            <span className="font-semibold">
              {owner.company || owner.name || owner.email}
            </span>
            . You cannot modify data in this mode.
          </div>
          {scope?.locations && scope.locations.length > 0 && (
            <div className="text-xs text-amber-200 mt-1">
              Scope: {scope.locations.join(", ")}
            </div>
          )}
        </div>
      </div>
      {expiresLabel && (
        <div className="text-xs text-amber-200 sm:text-right">
          Access expires: <span className="font-semibold">{expiresLabel}</span>
        </div>
      )}
    </div>
  );
}

