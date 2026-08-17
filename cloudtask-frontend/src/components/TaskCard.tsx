import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  isChangingStatus?: boolean;
  isDeleting?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "bg-sky-100 text-sky-800",
  medium: "bg-violet-100 text-violet-800",
  high: "bg-rose-100 text-rose-800",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isChangingStatus,
  isDeleting,
}: TaskCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{task.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-600 line-clamp-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status]}`}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-400">
        <span>created {formatDate(task.created_at)}</span>
        <span>updated {formatDate(task.updated_at)}</span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <select
          value={task.status}
          disabled={isChangingStatus}
          onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 disabled:opacity-50"
          aria-label={`Change status for ${task.title}`}
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <button
          onClick={() => onEdit(task)}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task)}
          disabled={isDeleting}
          className="ml-auto rounded-md border border-rose-200 px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
