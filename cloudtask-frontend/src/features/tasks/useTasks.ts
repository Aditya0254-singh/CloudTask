import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./tasksApi";
import type {
  CreateTaskRequest,
  TaskFilters,
  TaskStatus,
  UpdateTaskRequest,
} from "../../types";

// Centralized query key builder. Any component that lists tasks with the
// same filters shares this exact cache entry.
const tasksQueryKey = (filters: TaskFilters) => ["tasks", filters] as const;

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: tasksQueryKey(filters),
    queryFn: () => tasksApi.list(filters),
    select: (response) => response.data.tasks,
  });
}

// After any mutation that changes task data, invalidating the "tasks"
// prefix refetches every active list, regardless of its filters.
function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tasks"] });
}

export function useCreateTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: (input: CreateTaskRequest) => tasksApi.create(input),
    onSuccess: () => invalidateTasks(),
  });
}

export function useUpdateTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskRequest }) =>
      tasksApi.update(id, input),
    onSuccess: () => invalidateTasks(),
  });
}

export function useChangeTaskStatus() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.changeStatus(id, status),
    onSuccess: () => invalidateTasks(),
  });
}

export function useDeleteTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => invalidateTasks(),
  });
}
