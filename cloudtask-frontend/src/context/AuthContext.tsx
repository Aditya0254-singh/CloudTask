import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authApi } from "../features/auth/authApi";
import type { LoginInput, RegisterInput } from "../features/auth/authApi";
import type { User } from "../types";

const TOKEN_KEY = "cloudtask_token";
const USER_KEY = "cloudtask_user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Guards the first render so ProtectedRoute doesn't redirect to /login
  // before we've had a chance to check sessionStorage.
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        // Corrupted storage — treat as logged out rather than crashing.
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    }

    setIsInitializing(false);
  }, []);

  function persistSession(nextUser: User, nextToken: string) {
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
  }

  async function login(input: LoginInput) {
    const response = await authApi.login(input);
    persistSession(response.data.user, response.data.token);
  }

  async function register(input: RegisterInput) {
    const response = await authApi.register(input);
    // The backend already returns a token on registration, so we log the
    // user in immediately instead of sending them back to the login form.
    persistSession(response.data.user, response.data.token);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isInitializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
