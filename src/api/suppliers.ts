// Core API wrapper for supplier-related operations

import { apiRequest } from './client';

export interface Supplier {
  id: string | number;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  [key: string]: any;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const result = await apiRequest<{ data?: Supplier[] } | Supplier[]>(
    '/suppliers'
  );
  if (Array.isArray(result)) return result;
  if (result && Array.isArray((result as any).data)) {
    return (result as any).data;
  }
  return [];
}

