export default function StatsCards({ stats }) {
  const cards = [];

  // Executive Store Risk Score (optional, falls back gracefully if not provided)
  if (typeof stats.riskScore === "number") {
    let riskColor = "text-emerald-400";
    let riskBg = "bg-emerald-500/10";
    let subtitle = "Low compliance risk";

    if (stats.riskScore >= 85) {
      riskColor = "text-red-400";
      riskBg = "bg-red-500/10";
      subtitle = "Critical risk – immediate action required";
    } else if (stats.riskScore >= 60) {
      riskColor = "text-orange-400";
      riskBg = "bg-orange-500/10";
      subtitle = "High risk – address expired stock";
    } else if (stats.riskScore >= 30) {
      riskColor = "text-yellow-400";
      riskBg = "bg-yellow-500/10";
      subtitle = "Medium risk – monitor closely";
    }

    cards.push({
      title: "Store Risk Score",
      value: `${stats.riskScore}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M12 2a10 10 0 00-7.06 17.06A10 10 0 1012 2z"
          />
        </svg>
      ),
      bgColor: riskBg,
      textColor: riskColor,
      subtitle,
      urgent: stats.riskScore >= 60,
    });
  }

  cards.push(
    {
      title: "Total Items",
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      subtitle: "Active products",
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      subtitle: "Requires immediate action",
      urgent: stats.expired > 0,
    },
    {
      title: "Expiring Soon",
      value: stats.warning,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      subtitle: "Within 3 days",
    },
    {
      title: "Total Value",
      value: `$${(stats.totalValue / 1000).toFixed(1)}K`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      subtitle: "Inventory value",
    },
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`card-gradient rounded-2xl p-6 card-gradient-hover hover-lift animate-slide-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center ${card.textColor}`}>
              {card.icon}
            </div>
            {card.urgent && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full animate-pulse">
                URGENT
              </span>
            )}
          </div>
          <div className="text-3xl font-bold gradient-text mb-1">{card.value}</div>
          <div className="text-sm font-semibold text-white mb-1">{card.title}</div>
          <div className="text-xs text-slate-400">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}

