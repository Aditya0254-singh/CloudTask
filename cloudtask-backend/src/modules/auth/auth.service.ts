import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";
import { authRepository } from "./auth.repository";

const SALT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}): SafeUser {
  // Explicitly whitelist fields returned to the client.
  // password_hash is never included here on purpose.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: SafeUser; token: string }> {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await authRepository.createUser(name, email, passwordHash);
    const token = signToken(user.id, user.email);

    return { user: toSafeUser(user), token };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: SafeUser; token: string }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user.id, user.email);
    return { user: toSafeUser(user), token };
  },
};
