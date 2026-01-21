// Store Risk Scoring - Phase 1 (executive metric)
// Purely derived from existing expiry + quantity data.
// Higher score = higher compliance risk (0–100).

import { getStatus } from "./expiry";

/**
 * Compute account-level risk score from inventory items only.
 * This is intentionally simple and explainable for audit purposes.
 */
export function computeAccountRiskScore(items) {
  const activeItems = (items || []).filter((i) => !i.removed);
  const total = activeItems.length;

  if (total === 0) {
    return {
      riskScore: 0,
      riskBand: "Low",
      drivers: {
        expiredRatio: 0,
        warningRatio: 0,
        totalItems: 0,
        expired: 0,
        warning: 0,
      },
    };
  }

  const expired = activeItems.filter((i) => getStatus(i.expiry) === "EXPIRED").length;
  const warning = activeItems.filter((i) => getStatus(i.expiry) === "WARNING").length;

  const expiredRatio = expired / total;
  const warningRatio = warning / total;

  // Weighting: expired items are treated as more severe than warnings.
  const raw =
    expiredRatio * 0.7 + // 70% weight
    warningRatio * 0.3; // 30% weight

  const riskScore = Math.min(100, Math.max(0, Math.round(raw * 100)));

  let riskBand = "Low";
  if (riskScore >= 85) {
    riskBand = "Critical";
  } else if (riskScore >= 60) {
    riskBand = "High";
  } else if (riskScore >= 30) {
    riskBand = "Medium";
  }

  return {
    riskScore,
    riskBand,
    drivers: {
      expiredRatio,
      warningRatio,
      totalItems: total,
      expired,
      warning,
    },
  };
}

