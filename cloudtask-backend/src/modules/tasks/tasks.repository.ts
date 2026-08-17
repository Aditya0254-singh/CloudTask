import { pool } from "../../config/db";

export interface TaskRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
}

export interface UpdatableTaskFields {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
}

export const tasksRepository = {
  async create(
    userId: string,
    title: string,
    description: string | undefined,
    priority: string
  ): Promise<TaskRecord> {
    const result = await pool.query<TaskRecord>(
      `INSERT INTO tasks (user_id, title, description, priority, status)
       VALUES ($1, $2, $3, $4, 'todo')
       RETURNING *`,
      [userId, title, description ?? null, priority]
    );
    return result.rows[0];
  },

  async findAllForUser(
    userId: string,
    filters: TaskFilters
  ): Promise<TaskRecord[]> {
    const conditions: string[] = ["user_id = $1"];
    const values: unknown[] = [userId];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }

    if (filters.priority) {
      values.push(filters.priority);
      conditions.push(`priority = $${values.length}`);
    }

    if (filters.search) {
      values.push(`%${filters.search}%`);
      const paramIndex = values.length;
      conditions.push(
        `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      );
    }

    const query = `
      SELECT * FROM tasks
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `;

    const result = await pool.query<TaskRecord>(query, values);
    return result.rows;
  },

  async findByIdForUser(
    taskId: string,
    userId: string
  ): Promise<TaskRecord | null> {
    const result = await pool.query<TaskRecord>(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );
    return result.rows[0] ?? null;
  },

  async updateForUser(
    taskId: string,
    userId: string,
    fields: UpdatableTaskFields
  ): Promise<TaskRecord | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    // Build the SET clause dynamically from only the fields actually supplied.
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        values.push(value);
        setClauses.push(`${key} = $${values.length}`);
      }
    }

    // updated_at is always bumped, regardless of which fields changed.
    setClauses.push("updated_at = CURRENT_TIMESTAMP");

    values.push(taskId);
    const idParamIndex = values.length;
    values.push(userId);
    const userIdParamIndex = values.length;

    const query = `
      UPDATE tasks
      SET ${setClauses.join(", ")}
      WHERE id = $${idParamIndex} AND user_id = $${userIdParamIndex}
      RETURNING *
    `;

    const result = await pool.query<TaskRecord>(query, values);
    return result.rows[0] ?? null;
  },

  async deleteForUser(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
