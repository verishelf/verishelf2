// Core API wrapper for task-related operations
// This will replace direct Supabase access for tasks once
// wired into the React components behind USE_CORE_API.

import { apiRequest } from './client';

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  status?: string; // 'open' | 'completed' | etc.
  dueDate?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  [key: string]: any;
}

export async function getTasks(): Promise<Task[]> {
  const result = await apiRequest<{ data?: Task[] } | Task[]>('/tasks');
  if (Array.isArray(result)) return result;
  if (result && Array.isArray((result as any).data)) {
    return (result as any).data;
  }
  return [];
}

export async function completeTask(taskId: string | number): Promise<Task> {
  const result = await apiRequest<{ data?: Task } | Task>(
    `/tasks/${taskId}/complete`,
    { method: 'POST' }
  );
  if ((result as any).data) return (result as any).data;
  return result as Task;
}

