// Core API wrapper for inventory-related operations
// All new inventory data access should go through this module
// (behind the USE_CORE_API feature flag) instead of calling
// Supabase directly from React components.

import { apiRequest } from './client';

export interface InventoryItem {
  id: number | string;
  name: string;
  barcode?: string | null;
  location?: string | null;
  expiryDate?: string | null;
  expiry?: string | null;
  quantity?: number;
  category?: string | null;
  cost?: number | null;
  price?: number | null;
  notes?: string | null;
  removed?: boolean;
  removedAt?: string | null;
  addedAt?: string | null;
  aisle?: string | null;
  shelf?: string | null;
  status?: string | null;
  itemStatus?: string | null;
  [key: string]: any;
}

export interface InventoryQuery {
  location?: string;
  status?: string;
  search?: string;
}

export async function getInventory(
  query: InventoryQuery = {}
): Promise<InventoryItem[]> {
  const params = new URLSearchParams();
  if (query.location) params.append('location', query.location);
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);

  const path = params.toString()
    ? `/inventory/items?${params.toString()}`
    : '/inventory/items';

  const result = await apiRequest<{ data?: InventoryItem[] } | InventoryItem[]>(
    path
  );

  if (Array.isArray(result)) return result;
  if (result && Array.isArray((result as any).data)) {
    return (result as any).data;
  }
  return [];
}

export async function createInventoryItem(
  payload: Partial<InventoryItem>
): Promise<InventoryItem> {
  const result = await apiRequest<{ data?: InventoryItem } | InventoryItem>(
    '/inventory/items',
    { method: 'POST', body: payload }
  );
  if ((result as any).data) return (result as any).data;
  return result as InventoryItem;
}

export async function updateInventoryItem(
  id: string | number,
  payload: Partial<InventoryItem>
): Promise<InventoryItem> {
  const result = await apiRequest<{ data?: InventoryItem } | InventoryItem>(
    `/inventory/items/${id}`,
    { method: 'PUT', body: payload }
  );
  if ((result as any).data) return (result as any).data;
  return result as InventoryItem;
}

export async function deleteInventoryItem(
  id: string | number
): Promise<void> {
  await apiRequest<void>(`/inventory/items/${id}`, { method: 'DELETE' });
}

