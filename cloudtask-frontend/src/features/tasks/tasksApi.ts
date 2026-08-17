import { apiClient } from "../../api/client";
import type {
  ApiResponse,
  CreateTaskRequest,
  Task,
  TaskFilters,
  TaskStatus,
  UpdateTaskRequest,
} from "../../types";

// Builds a query string from only the filters that are actually set,
// so an "all tasks" request doesn't send empty params.
function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const tasksApi = {
  list(filters: TaskFilters) {
    return apiClient.get<ApiResponse<{ tasks: Task[] }>>(
      `/tasks${buildQueryString(filters)}`
    );
  },

  getOne(id: string) {
    return apiClient.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
  },

  create(input: CreateTaskRequest) {
    return apiClient.post<ApiResponse<{ task: Task }>>("/tasks", input);
  },

  update(id: string, input: UpdateTaskRequest) {
    return apiClient.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, input);
  },

  changeStatus(id: string, status: TaskStatus) {
    return apiClient.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, {
      status,
    });
  },

  remove(id: string) {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};
