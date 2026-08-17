import { pool } from "../../config/db";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export const authRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool.query<UserRecord>(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] ?? null;
  },

  async createUser(
    name: string,
    email: string,
    passwordHash: string
  ): Promise<UserRecord> {
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash, created_at`,
      [name, email, passwordHash]
    );
    return result.rows[0];
  },
};
