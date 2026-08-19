import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PaginatedTasks, Task, TaskFilters } from '../lib/types';

const TASKS_KEY = 'tasks';

export function useTasks(filters: TaskFilters) {
  return useQuery<PaginatedTasks>({
    queryKey: [TASKS_KEY, filters],
    queryFn: async () => {
      const params: Record<string, any> = { page: filters.page ?? 1, limit: filters.limit ?? 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await api.get('/tasks', { params });
      return data;
    },
  });
}

export function useTask(id: string | undefined) {
  return useQuery<Task>({
    queryKey: [TASKS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

function toFormData(payload: Record<string, any>, file?: File | null) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value as string);
    }
  });
  if (file) formData.append('file', file);
  return formData;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payload, file }: { payload: Record<string, any>; file?: File | null }) => {
      const { data } = await api.post('/tasks', toFormData(payload, file), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as Task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
      file,
    }: {
      id: string;
      payload: Record<string, any>;
      file?: File | null;
    }) => {
      const { data } = await api.patch(`/tasks/${id}`, toFormData(payload, file), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as Task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}
