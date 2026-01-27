// Core API wrapper for expiry-related operations
// NOTE: This module is used behind a feature flag so we can
// gradually migrate from client-side expiry calculations to
// centralized Core API logic without breaking existing flows.

import { apiRequest } from './client';

// Shape of an expiry alert returned by the Core API.
// This is intentionally flexible while the API stabilizes.
export interface ExpiryAlert {
  id?: string | number;
  type?: string; // 'expired' | 'expiring' | 'low_stock' | ...
  priority?: 'high' | 'medium' | 'low';
  item?: any;
  message?: string;
  daysUntil?: number;
  location?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Fetch expiry alerts from the Core API.
 *
 * Endpoint (Core API):
 *   GET /api/v1/expiry/alerts
 *
 * Authentication:
 *   Authorization: Bearer <supabase_jwt>
 */
export async function getExpiryAlerts(): Promise<ExpiryAlert[]> {
  // The client handles base URL, JWT, logging, and errors.
  const alerts = await apiRequest<ExpiryAlert[]>('/expiry/alerts');
  return Array.isArray(alerts) ? alerts : [];
}

