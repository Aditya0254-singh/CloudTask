import { apiClient } from "../../api/client";
import type { ApiResponse, AuthResponseData } from "../../types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register(input: RegisterInput) {
    return apiClient.post<ApiResponse<AuthResponseData>>("/auth/register", input);
  },

  login(input: LoginInput) {
    return apiClient.post<ApiResponse<AuthResponseData>>("/auth/login", input);
  },
};
