import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Modal } from "../components/Modal";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import type { TaskFormValues } from "../components/TaskForm";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  useChangeTaskStatus,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { ApiError } from "../api/client";
import type { Task, TaskPriority, TaskStatus } from "../types";

type ModalState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export function DashboardPage() {
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [modalState, setModalState] = useState<ModalState>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filters = {
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
  };

  const tasksQuery = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();
  const deleteTask = useDeleteTask();

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  function showFeedback(message: string) {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  }

  function handleCreateSubmit(values: TaskFormValues) {
    setFormError(null);
    createTask.mutate(
      { title: values.title, description: values.description || undefined, priority: values.priority },
      {
        onSuccess: () => {
          setModalState(null);
          showFeedback("Task created.");
        },
        onError: (err) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to create task.");
        },
      }
    );
  }

  function handleEditSubmit(values: TaskFormValues) {
    if (modalState?.mode !== "edit") return;
    setFormError(null);
    updateTask.mutate(
      {
        id: modalState.task.id,
        input: {
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          setModalState(null);
          showFeedback("Task updated.");
        },
        onError: (err) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update task.");
        },
      }
    );
  }

  function handleStatusChange(task: Task, newStatus: TaskStatus) {
    changeStatus.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () => showFeedback("Status updated."),
        onError: (err) => showFeedback(err instanceof ApiError ? err.message : "Failed to update status."),
      }
    );
  }

  function handleDelete(task: Task) {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingTaskId(task.id);
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setDeletingTaskId(null);
        showFeedback("Task deleted.");
      },
      onError: (err) => {
        setDeletingTaskId(null);
        showFeedback(err instanceof ApiError ? err.message : "Failed to delete task.");
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Task Dashboard</h1>
          <button
            onClick={() => {
              setFormError(null);
              setModalState({ mode: "create" });
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + Create Task
          </button>
        </div>

        {feedback && (
          <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[200px] gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title or description..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {tasksQuery.isLoading && <LoadingSpinner label="Loading tasks..." />}

        {tasksQuery.isError && (
          <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to load tasks.
          </div>
        )}

        {tasksQuery.isSuccess && tasksQuery.data.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
            No tasks found.
          </div>
        )}

        {tasksQuery.isSuccess && tasksQuery.data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasksQuery.data.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setFormError(null);
                  setModalState({ mode: "edit", task: t });
                }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isChangingStatus={changeStatus.isPending && changeStatus.variables?.id === task.id}
                isDeleting={deletingTaskId === task.id}
              />
            ))}
          </div>
        )}
      </main>

      {modalState?.mode === "create" && (
        <Modal title="Create task" onClose={() => setModalState(null)}>
          <TaskForm
            mode="create"
            isSubmitting={createTask.isPending}
            errorMessage={formError}
            onSubmit={handleCreateSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {modalState?.mode === "edit" && (
        <Modal title="Edit task" onClose={() => setModalState(null)}>
          <TaskForm
            mode="edit"
            initialTask={modalState.task}
            isSubmitting={updateTask.isPending}
            errorMessage={formError}
            onSubmit={handleEditSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </div>
  );
}
