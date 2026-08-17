import { useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types";

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
}

interface TaskFormProps {
  mode: "create" | "edit";
  initialTask?: Task;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

export function TaskForm({
  mode,
  initialTask,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? "medium");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "todo");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setValidationError("Title is required.");
      return;
    }
    if (trimmedTitle.length > 200) {
      setValidationError("Title must be at most 200 characters.");
      return;
    }

    setValidationError(null);
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status: mode === "edit" ? status : undefined,
    });
  }

  const displayError = validationError ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="e.g. Prepare AWS project"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Optional details"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Status is only editable when editing — new tasks always start as "todo". */}
        {mode === "edit" && (
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>

      {displayError && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{displayError}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
